// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import Breadcrumbs from "../components/breadcrumbs";
import { FacetSection, FacetTags } from "../components/facets";
import NoCollectionData from "../components/no-collection-data";
import PagePreamble from "../components/page-preamble";
import {
  getAccessoryData,
  getItemListsByType,
  getSearchListItemRenderer,
  SearchListItem,
} from "../components/search";
import {
  SearchResultsCount,
  SearchResultsHeader,
} from "../components/search-results";
import SessionContext from "../components/session-context";
// lib
import buildBreadcrumbs from "../lib/breadcrumbs";
import { generateFacetKey } from "../lib/facets";
import errorObjectToProps from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { getQueryStringFromServerQuery } from "../lib/query-utils";
import { composeSearchResultsPageTitle } from "../lib/search-results";

/**
 * Displays all /search pages. These display a list of results from a search query. Most of the
 * components this relies on use the term, "search list," to distinguish it from other kinds of
 * search-result display pages, such as /report.
 */
export default function Search({ searchResults, accessoryData = null }) {
  const { profiles } = useContext(SessionContext);
  const pageTitle = profiles
    ? composeSearchResultsPageTitle(searchResults, profiles)
    : "";

  return (
    <>
      <Breadcrumbs />
      {pageTitle && <PagePreamble pageTitle={pageTitle} />}
      {searchResults.total > 0 ? (
        <div className="lg:flex lg:items-start lg:gap-1">
          <FacetSection
            key={generateFacetKey(searchResults)}
            searchResults={searchResults}
          />
          <div className="grow">
            <FacetTags searchResults={searchResults} />
            <SearchResultsHeader searchResults={searchResults} />
            <SearchResultsCount count={searchResults.total} />
            <ul data-testid="search-list">
              {searchResults["@graph"].map((item) => {
                // For each item, get the appropriate search-list item renderer for it, or the
                // fallback render if the item type doesn't have one.
                const SearchListItemRenderer = getSearchListItemRenderer(item);
                return (
                  <SearchListItem
                    key={item["@id"]}
                    testid={item["@id"]}
                    href={item["@id"]}
                  >
                    <SearchListItemRenderer
                      item={item}
                      accessoryData={accessoryData}
                    />
                  </SearchListItem>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <NoCollectionData pageTitle="list items" />
      )}
    </>
  );
}

Search.propTypes = {
  // /search results from igvfd
  searchResults: PropTypes.object.isRequired,
  // Accessory data for search results, keyed by each object's `@id`
  accessoryData: PropTypes.object,
};

export async function getServerSideProps({ req, query }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const queryParams = getQueryStringFromServerQuery(query);
  const searchResults = await request.getObject(`/search/?${queryParams}`);

  if (FetchRequest.isResponseSuccess(searchResults)) {
    const itemListsByType = getItemListsByType(searchResults);
    const accessoryData = await getAccessoryData(
      itemListsByType,
      req.headers.cookie
    );
    const breadcrumbs = await buildBreadcrumbs(
      searchResults,
      "",
      req.headers.cookie
    );
    return {
      props: {
        searchResults,
        accessoryData,
        pageContext: { title: "title" },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(searchResults);
}
