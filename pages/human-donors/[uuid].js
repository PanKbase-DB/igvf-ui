// node_modules
import PropTypes from "prop-types";
import { Fragment } from "react";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { DonorDataItems } from "../../components/common-data-items";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import { requestOntologyTerms } from "../../lib/common-requests";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import JsonDisplay from "../../components/json-display";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import PhenotypicFeatureTable from "../../components/phenotypic-feature-table";
import RelatedDonorsTable from "../../components/related-donors-table";
import SeparatedList from "../../components/separated-list";
// lib
import buildAttribution from "../../lib/attribution";
import buildBreadcrumbs from "../../lib/breadcrumbs";
import {
  requestDocuments,
  requestDonors,
  requestPhenotypicFeatures,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { isJsonFormat } from "../../lib/query-utils";

export default function HumanDonor({
  donor,
  phenotypicFeatures,
  relatedDonors,
  diabetesStatus,
  otherTissue,
  documents,
  attribution = null,
  isJson,
}) {
  return (
    <>
      <Breadcrumbs />
      <EditableItem item={donor}>
        <PagePreamble>
          <AlternateAccessions
            alternateAccessions={donor.alternate_accessions}
          />
        </PagePreamble>
        <ObjectPageHeader item={donor} isJsonFormat={isJson} />
        <JsonDisplay item={donor} isJsonFormat={isJson}>
          <DataPanel>
          <DataArea>
              <DonorDataItems item={donor} diabetesStatus={diabetesStatus} otherTissue={otherTissue}/>
              {donor.human_donor_identifiers?.length > 0 && (
                <>
                  <DataItemLabel>Identifiers</DataItemLabel>
                  <DataItemValue>
                    <SeparatedList isCollapsible>
                      {donor.human_donor_identifiers.map((identifier) => (
                        <Fragment key={identifier}>{identifier}</Fragment>
                      ))}
                    </SeparatedList>
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {phenotypicFeatures.length > 0 && (
            <PhenotypicFeatureTable phenotypicFeatures={phenotypicFeatures} />
          )}
          {relatedDonors.length > 0 && (
            <RelatedDonorsTable
              relatedDonors={relatedDonors}
              embeddedDonors={donor.related_donors}
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
          <Attribution attribution={attribution} />
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

HumanDonor.propTypes = {
  // Human donor to display
  donor: PropTypes.object.isRequired,
  // Phenotypic features associated with human donor
  phenotypicFeatures: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Other Diabetes Status associated with human donor
  diabetesStatus: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Other Tissue associated with human donor
  otherTissue: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Related donors associated with human donor
  relatedDonors: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with human donor
  documents: PropTypes.arrayOf(PropTypes.object).isRequired,
  // HumanDonor attribution
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query }) {
  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const donor = (
    await request.getObject(`/human-donors/${params.uuid}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(donor)) {
    let phenotypicFeatures = [];
    if (donor.phenotypic_features?.length > 0) {
      const phenotypicFeaturePaths = donor.phenotypic_features.map(
        (feature) => feature["@id"]
      );
      phenotypicFeatures = await requestPhenotypicFeatures(
        phenotypicFeaturePaths,
        request
      );
    }
    let relatedDonors = [];
    if (donor.related_donors?.length > 0) {
      const relatedDonorPaths = donor.related_donors.map(
        (relatedDonor) => relatedDonor.donor["@id"]
      );
      relatedDonors = await requestDonors(relatedDonorPaths, request);
    }

    const documents = donor.documents
      ? await requestDocuments(donor.documents, request)
      : [];

    const breadcrumbs = await buildBreadcrumbs(
      donor,
      donor.accession,
      req.headers.cookie
    );
    const attribution = await buildAttribution(donor, req.headers.cookie);
    const diabetesStatus = donor.diabetes_status.length > 0
      ? await requestOntologyTerms(donor.diabetes_status, request)
          : [];
    const otherTissue = donor.other_tissues_available.length > 0
      ? await requestOntologyTerms(donor.other_tissues_available, request)
          : [];
    return {
      props: {
        donor,
        phenotypicFeatures,
        relatedDonors,
        diabetesStatus,
        otherTissue,
        documents,
        pageContext: { title: donor.accession },
        breadcrumbs,
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(donor);
}
