// node_modules
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import { OntologyTermDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DbxrefList from "../../components/dbxref-list";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import { requestOntologyTerms } from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function SampleOntologyTerm({
  sampleOntologyTerm,
  isA,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={sampleOntologyTerm}>
        <PagePreamble />
        <ObjectPageHeader item={sampleOntologyTerm} isJsonFormat={isJson} />
        <JsonDisplay item={sampleOntologyTerm} isJsonFormat={isJson}>
          <DataPanel>
            <DataArea>
              {sampleOntologyTerm.dbxrefs?.length > 0 && (
                <>
                  <DataItemLabel>External Resources</DataItemLabel>
                  <DataItemValue>
                    <DbxrefList
                      dbxrefs={sampleOntologyTerm.dbxrefs}
                      isCollapsible
                    />
                  </DataItemValue>
                </>
              )}
              <OntologyTermDataItems item={sampleOntologyTerm} isA={isA}>
                {sampleOntologyTerm.organ_slims.length > 0 && (
                  <>
                    <DataItemLabel>Organs</DataItemLabel>
                    <DataItemValue>
                      {sampleOntologyTerm.organ_slims.join(", ")}
                    </DataItemValue>
                  </>
                )}
                {sampleOntologyTerm.cell_slims.length > 0 && (
                  <>
                    <DataItemLabel>Cells</DataItemLabel>
                    <DataItemValue>
                      {sampleOntologyTerm.cell_slims.join(", ")}
                    </DataItemValue>
                  </>
                )}
                {sampleOntologyTerm.developmental_slims.length > 0 && (
                  <>
                    <DataItemLabel>Developmental Slims</DataItemLabel>
                    <DataItemValue>
                      {sampleOntologyTerm.developmental_slims.join(", ")}
                    </DataItemValue>
                  </>
                )}
                {sampleOntologyTerm.system_slims.length > 0 && (
                  <>
                    <DataItemLabel>System Slims</DataItemLabel>
                    <DataItemValue>
                      {sampleOntologyTerm.system_slims.join(", ")}
                    </DataItemValue>
                  </>
                )}
              </OntologyTermDataItems>
            </DataArea>
          </DataPanel>
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

SampleOntologyTerm.propTypes = {
  // Sample ontology term object to display
  sampleOntologyTerm: PropTypes.object.isRequired,
  // List of term names
  isA: PropTypes.arrayOf(PropTypes.object),
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sampleOntologyTerm = (
    await request.getObject(`/sample-terms//${params.name}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(sampleOntologyTerm)) {
    const isA = sampleOntologyTerm.is_a
      ? await requestOntologyTerms(sampleOntologyTerm.is_a, request)
      : [];
    const breadcrumbs = await buildBreadcrumbs(
      sampleOntologyTerm,
      sampleOntologyTerm.term_id,
      req.headers.cookie
    );
    return {
      props: {
        sampleOntologyTerm,
        isA,
        pageContext: { title: sampleOntologyTerm.term_id },
        breadcrumbs,
        isJson,
      },
    };
  }
  return errorObjectToProps(sampleOntologyTerm);
}
