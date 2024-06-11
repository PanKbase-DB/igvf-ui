// node_modules
import _ from "lodash";
import PropTypes from "prop-types";
// components
import AliasList from "../../components/alias-list";
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import DocumentTable from "../../components/document-table";
import DonorTable from "../../components/donor-table";
import { EditableItem } from "../../components/edit";
import FileTable from "../../components/file-table";
import FileSetTable from "../../components/file-set-table";
import InputFileSets from "../../components/input-file-sets";
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
  requestSamples,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";
import SampleTable from "../../components/sample-table";

export default function AnalysisSet({
  analysisSet,
  documents,
  files,
  inputFileSets,
  inputFileSetSamples,
  controlFileSets,
  appliedToSamples,
  auxiliarySets,
  measurementSets,
  constructLibrarySets,
  curatedSets,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={analysisSet}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={analysisSet.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={analysisSet} isJsonFormat={isJson} />
        <JsonDisplay item={analysisSet} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              {analysisSet.aliases?.length > 0 && (
                <>
                  <DataItemLabel>Aliases</DataItemLabel>
                  <DataItemValue>
                    <AliasList aliases={analysisSet.aliases} />
                  </DataItemValue>
                </>
              )}
              <DataItemLabel>File Set Type</DataItemLabel>
              <DataItemValue>{analysisSet.file_set_type}</DataItemValue>
              {analysisSet.publication_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Publication Identifiers</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList
                      dbxrefs={analysisSet.publication_identifiers}
                      isCollapsible
                    />
                  </DataItemValue>
                </>
              )}
              {analysisSet.submitter_comment && (
                <>
                  <DataItemLabel>Submitter Comment</DataItemLabel>
                  <DataItemValue>{analysisSet.submitter_comment}</DataItemValue>
                </>
              )}
              {analysisSet.summary && (
                <>
                  <DataItemLabel>Summary</DataItemLabel>
                  <DataItemValue>{analysisSet.summary}</DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>

          {analysisSet.samples?.length > 0 && (
            <SampleTable
              samples={analysisSet.samples}
              reportLink={`/multireport/?type=Sample&file_sets.@id=${analysisSet["@id"]}`}
            />
          )}

          {analysisSet.donors?.length > 0 && (
            <DonorTable donors={analysisSet.donors} />
          )}

          {inputFileSets.length > 0 && (
            <InputFileSets
              fileSets={inputFileSets}
              samples={inputFileSetSamples}
              controlFileSets={controlFileSets}
              appliedToSamples={appliedToSamples}
              auxiliarySets={auxiliarySets}
              measurementSets={measurementSets}
              constructLibrarySets={constructLibrarySets}
            />
          )}

          {curatedSets.length > 0 && (
            <FileSetTable fileSets={curatedSets} title="Curated Sets" />
          )}

          {files.length > 0 && (
            <FileTable files={files} fileSetPath={analysisSet["@id"]} />
          )}

          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

AnalysisSet.propTypes = {
  analysisSet: PropTypes.object.isRequired,
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Input file sets to display
  inputFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Input file set samples
  inputFileSetSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Control file sets to display
  controlFileSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Applied-to samples to display
  appliedToSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // AuxiliarySets to display
  auxiliarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // MeasurementSets to display
  measurementSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // ConstructLibrarySets to display
  constructLibrarySets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // CuratedSets to display
  curatedSets: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this analysis set
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Attribution for this analysis set
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const analysisSet = (
    await request.getObject(`/analysis-sets/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(analysisSet)) {
    const documents = analysisSet.documents
      ? await requestDocuments(analysisSet.documents, request)
      : [];

    const filePaths = analysisSet.files.map((file) => file["@id"]);
    const files =
      filePaths.length > 0 ? await requestFiles(filePaths, request) : [];

    let inputFileSets = [];
    if (analysisSet.input_file_sets?.length > 0) {
      // The embedded `input_file_sets` in the analysis set don't have enough properties to display
      // in the table, so we have to request them.
      const inputFileSetPaths = analysisSet.input_file_sets.map(
        (fileSet) => fileSet["@id"]
      );
      inputFileSets = await requestFileSets(inputFileSetPaths, request, [
        "applied_to_samples",
        "auxiliary_sets",
        "control_file_sets",
        "measurement_sets",
      ]);
    }

    let appliedToSamples = [];
    let auxiliarySets = [];
    let controlFileSets = [];
    let measurementSets = [];
    if (inputFileSets.length > 0) {
      // Retrieve the input file sets' applied to samples.
      appliedToSamples = inputFileSets.reduce((acc, fileSet) => {
        return fileSet.applied_to_samples?.length > 0
          ? acc.concat(fileSet.applied_to_samples)
          : acc;
      }, []);
      let appliedToSamplePaths = appliedToSamples.map(
        (sample) => sample["@id"]
      );
      appliedToSamplePaths = [...new Set(appliedToSamplePaths)];
      appliedToSamples =
        appliedToSamplePaths.length > 0
          ? await requestSamples(appliedToSamplePaths, request)
          : [];

      // Retrieve the input file sets' auxiliary sets.
      let auxiliarySetsPaths = inputFileSets.reduce((acc, fileSet) => {
        return fileSet.auxiliary_sets?.length > 0
          ? acc.concat(
              fileSet.auxiliary_sets.map((auxiliarySet) => auxiliarySet["@id"])
            )
          : acc;
      }, []);
      auxiliarySetsPaths = [...new Set(auxiliarySetsPaths)];
      auxiliarySets =
        auxiliarySetsPaths.length > 0
          ? await requestFileSets(auxiliarySetsPaths, request)
          : [];

      // Retrieve the input file sets' measurement sets.
      measurementSets = inputFileSets.reduce((acc, fileSet) => {
        return fileSet.measurement_sets?.length > 0
          ? acc.concat(fileSet.measurement_sets)
          : acc;
      }, []);
      let measurementSetPaths = measurementSets.map(
        (measurementSet) => measurementSet["@id"]
      );
      measurementSetPaths = [...new Set(measurementSetPaths)];
      measurementSets =
        measurementSetPaths.length > 0
          ? await requestFileSets(measurementSetPaths, request)
          : [];

      // Retrieve the input file sets' control file sets.
      controlFileSets = inputFileSets.reduce((acc, fileSet) => {
        return fileSet.control_file_sets?.length > 0
          ? acc.concat(fileSet.control_file_sets)
          : acc;
      }, []);
      let controlFileSetPaths = controlFileSets.map(
        (controlFileSet) => controlFileSet["@id"]
      );
      controlFileSetPaths = [...new Set(controlFileSetPaths)];
      controlFileSets = await requestFileSets(controlFileSetPaths, request);
    }

    const embeddedSamples = inputFileSets.reduce((acc, inputFileSet) => {
      return inputFileSet.samples?.length > 0
        ? acc.concat(inputFileSet.samples)
        : acc;
    }, []);

    let inputFileSetSamples = [];
    if (embeddedSamples.length > 0) {
      let samplePaths = embeddedSamples.map((sample) => sample["@id"]);
      samplePaths = [...new Set(samplePaths)];
      inputFileSetSamples = await requestSamples(samplePaths, request);
    }

    let constructLibrarySets = [];
    if (inputFileSetSamples.length > 0) {
      let constructLibrarySetPaths = inputFileSetSamples.reduce(
        (acc, sample) => {
          return sample.construct_library_sets?.length > 0
            ? acc.concat(sample.construct_library_sets)
            : acc;
        },
        []
      );

      if (constructLibrarySetPaths.length > 0) {
        constructLibrarySetPaths = [...new Set(constructLibrarySetPaths)];
        constructLibrarySets = await requestFileSets(
          constructLibrarySetPaths,
          request,
          ["integrated_content_files"]
        );
      }
    }

    // Curated sets come from the `file_set` properties of the files in the
    // `integrated_content_files` of the construct library sets.
    let curatedSets = [];
    if (constructLibrarySets.length > 0) {
      let integratedContentFiles = [];
      let integratedContentFilePaths = constructLibrarySets.reduce(
        (acc, constructLibrarySet) => {
          return constructLibrarySet.integrated_content_files?.length > 0
            ? acc.concat(constructLibrarySet.integrated_content_files)
            : acc;
        },
        []
      );
      if (integratedContentFilePaths.length > 0) {
        integratedContentFilePaths = [...new Set(integratedContentFilePaths)];
        integratedContentFiles = await requestFiles(
          integratedContentFilePaths,
          request
        );
      }

      if (integratedContentFiles.length > 0) {
        let fileSetPaths = integratedContentFiles
          .map((file) => file.file_set)
          .filter((fileSet) => fileSet);
        fileSetPaths = [...new Set(fileSetPaths)];
        if (fileSetPaths.length > 0) {
          curatedSets = await requestFileSets(fileSetPaths, request);
        }
      }
    }

    const breadcrumbs = await buildBreadcrumbs(
      analysisSet,
      analysisSet.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(analysisSet, req.headers.cookie);
    return {
      props: {
        analysisSet,
        documents,
        files,
        inputFileSets,
        inputFileSetSamples,
        controlFileSets,
        appliedToSamples,
        auxiliarySets,
        measurementSets,
        constructLibrarySets,
        curatedSets,
        pageContext: { title: analysisSet.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(analysisSet);
}
