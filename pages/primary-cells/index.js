// node_modules
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  Collection,
  CollectionCount,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection"
import NoCollectionData from "../../components/no-collection-data"
import PagePreamble from "../../components/page-preamble"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const PrimaryCellList = ({ primaryCells }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {primaryCells.length > 0 ? (
          <>
            <CollectionCount count={primaryCells.length} />
            {primaryCells.map((primaryCell) => (
              <CollectionItem
                key={primaryCell.uuid}
                href={primaryCell["@id"]}
                label={`Primary Cell ${primaryCell.accession}`}
                status={primaryCell.status}
              >
                <CollectionItemName>{primaryCell.accession}</CollectionItemName>
                {primaryCell.organism && <div>{primaryCell.organism}</div>}
                {primaryCell.nih_institutional_certification && (
                  <div>{primaryCell.nih_institutional_certification}</div>
                )}
              </CollectionItem>
            ))}
          </>
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  )
}

PrimaryCellList.propTypes = {
  // Primary cells list to display
  primaryCells: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default PrimaryCellList

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie)
  const primaryCells = await request.getCollection("primary-cells")
  const breadcrumbs = await buildBreadcrumbs(primaryCells, "title")
  return {
    props: {
      primaryCells: primaryCells["@graph"],
      pageContext: { title: primaryCells.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  }
}