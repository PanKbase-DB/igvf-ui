// node_modules
import Link from "next/link";
import PropTypes from "prop-types";
// components
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import JsonDisplay from "../../components/json-display";
import PagePreamble from "../../components/page-preamble";
import SeparatedList from "../../components/separated-list";
// lib
import AliasList from "../../components/alias-list";
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function CuratedSet({
  curatedSet,
  documents,
  donors,
  files,
  samples,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={curatedSet}>
        <PagePreamble />
        <JsonDisplay item={curatedSet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              <DataItemLabel>Curated Set Type</DataItemLabel>
              <DataItemValue>{curatedSet.curated_set_type}</DataItemValue>
              {curatedSet.taxa && (
                <>
                  <DataItemLabel>Taxa</DataItemLabel>
                  <DataItemValue>{curatedSet.taxa}</DataItemValue>
                </>
              )}
              {curatedSet.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={curatedSet.aliases} />
                  </DataItemValue>
                </>
              )}
              {donors.length > 0 && (
                <>
                  <DataItemLabel>Donors</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {donors.map((donor) => (
                        <Link href={donor["@id"]} key={donor.uuid}>
                          {donor.accession}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
              {samples.length > 0 && (
                <>
                  <DataItemLabel>Samples</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList>
                      {samples.map((sample) => (
                        <Link href={sample["@id"]} key={sample.uuid}>
                          {sample.accession}
                        </Link>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {files.length > 0 && (
            <>
              <DataAreaTitle>Files</DataAreaTitle>
              <FileTable files={files} />
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

CuratedSet.propTypes = {
  curatedSet: PropTypes.object.isRequired,
  // Donors to display
  donors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Samples to display
  samples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this curated set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this curated set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const curatedSet = await request.getObject(`/curated-sets/${params.id}/`);
  if (FetchRequest.isResponseSuccess(curatedSet)) {
    const documents = curatedSet.documents
      ? await request.getMultipleObjects(curatedSet.documents, null, {
          filterErrors: true,
        })
      : [];
    const samples = curatedSet.samples
      ? await request.getMultipleObjects(curatedSet.samples, null, {
          filterErrors: true,
        })
      : [];
    const donors = curatedSet.donors
      ? await request.getMultipleObjects(curatedSet.donors, null, {
          filterErrors: true,
        })
      : [];
    const files = curatedSet.files
      ? await request.getMultipleObjects(curatedSet.files, null, {
          filterErrors: true,
        })
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      curatedSet,
      "accession",
      req.headers.cookie
    );
    const attribution = await buildAttribution(curatedSet, req.headers.cookie);
    return {
      props: {
        curatedSet,
        documents,
        donors,
        files,
        samples,
        pageContext: { title: curatedSet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(curatedSet);
}
