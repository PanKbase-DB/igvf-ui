// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataItemValueUrl,
  DataPanel,
} from "../../components/data-area";
import DerivedFromTable from "../../components/derived-from-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import { FileHeaderDownload } from "../../components/file-download";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestFileSets,
  requestFiles,
} from "../../lib/common-requests";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { isJsonFormat } from "../../lib/query-utils";

export default function ReferenceFile({
  referenceFile,
  fileSet,
  documents,
  derivedFrom,
  derivedFromFileSets,
  fileFormatSpecifications,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={referenceFile}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={referenceFile.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={referenceFile} isJsonFormat={isJson}>
          <FileHeaderDownload file={referenceFile} />
        </ObjectPageHeader>
        <JsonDisplay item={referenceFile} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <FileDataItems
                item={referenceFile}
                fileSet={fileSet}
              ></FileDataItems>
            </DataArea>
          </DataPanel>
          {(referenceFile.assembly ||
            referenceFile.source_url ||
            referenceFile.transcriptome_annotation) && (
            <>
              <DataAreaTitle>Reference Details</DataAreaTitle>
              <DataPanel>
                <DataArea>
                  {referenceFile.assembly && (
                    <>
                      <DataItemLabel>Genome Assembly</DataItemLabel>
                      <DataItemValue>{referenceFile.assembly}</DataItemValue>
                    </>
                  )}
                  {referenceFile.transcriptome_annotation && (
                    <>
                      <DataItemLabel>Transcriptome Annotation</DataItemLabel>
                      <DataItemValue>
                        {referenceFile.transcriptome_annotation}
                      </DataItemValue>
                    </>
                  )}
                  {referenceFile.source_url && (
                    <>
                      <DataItemLabel>Source URL</DataItemLabel>
                      <DataItemValueUrl>
                        <a
                          href={referenceFile.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {referenceFile.source_url}
                        </a>
                      </DataItemValueUrl>
                    </>
                  )}
                </DataArea>
              </DataPanel>
            </>
          )}
          {derivedFrom.length > 0 && (
            <>
              <DataAreaTitle>
                Files {referenceFile.accession} Derives From
              </DataAreaTitle>
              <DerivedFromTable
                derivedFrom={derivedFrom}
                derivedFromFileSets={derivedFromFileSets}
              />
            </>
          )}
          {fileFormatSpecifications.length > 0 && (
            <>
              <DataAreaTitle>File Format Specifications</DataAreaTitle>
              <DocumentTable documents={fileFormatSpecifications} />
            </>
          )}
          {documents.length > 0 && (
            <>
              <DataAreaTitle>Documents</DataAreaTitle>
              <DocumentTable documents={documents} />
            </>
          )}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

ReferenceFile.propTypes = {
  // ReferenceFile object to display
  referenceFile: PropTypes.object.isRequired,
  // File set that contains this file
  fileSet: PropTypes.object,
  // Documents set associate with this file
  documents: PropTypes.array,
  // The file is derived from
  derivedFrom: PropTypes.array,
  // Filesets derived from files belong to
  derivedFromFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Set of documents for file specifications
  fileFormatSpecifications: PropTypes.array.isRequired,
  // Attribution for this ReferenceFile
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  // Redirect to the file page if the URL is a file download link.
  if (checkForFileDownloadPath(resolvedUrl)) {
    return {
      redirect: {
        destination: convertFileDownloadPathToFilePagePath(resolvedUrl),
        permanent: false,
      },
    };
  }

  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const referenceFile = await request.getObject(
    `/reference-files/${params.id}/`
  );
  if (FetchRequest.isResponseSuccess(referenceFile)) {
    const fileSet = await request.getObject(referenceFile.file_set, null);
    const documents = referenceFile.documents
      ? await requestDocuments(referenceFile.documents, request)
      : [];
    const derivedFrom = referenceFile.derived_from
      ? await requestFiles(referenceFile.derived_from, request)
      : [];
    const derivedFromFileSetPaths = derivedFrom
      .map((file) => file.file_set)
      .filter((fileSet) => fileSet);
    const uniqueDerivedFromFileSetPaths = [...new Set(derivedFromFileSetPaths)];
    const derivedFromFileSets =
      uniqueDerivedFromFileSetPaths.length > 0
        ? await requestFileSets(uniqueDerivedFromFileSetPaths, request)
        : [];
    const fileFormatSpecifications = referenceFile.file_format_specifications
      ? await requestDocuments(
          referenceFile.file_format_specifications,
          request
        )
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      referenceFile,
      referenceFile.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(
      referenceFile,
      req.headers.cookie
    );
    return {
      props: {
        referenceFile,
        fileSet,
        documents,
        derivedFrom,
        derivedFromFileSets,
        fileFormatSpecifications,
        pageContext: { title: referenceFile.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(referenceFile);
}
