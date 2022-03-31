// node_modules
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  Collection,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection"
import PagePreamble from "../../components/page-preamble"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import { getCollection } from "../../libs/request"

const AwardList = ({ awards }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {awards.map((award) => (
          <CollectionItem
            key={award.uuid}
            href={award["@id"]}
            label={`Award ${award.name}`}
          >
            <CollectionItemName>{award.name}</CollectionItemName>
            <div>{award.title}</div>
          </CollectionItem>
        ))}
      </Collection>
    </>
  )
}

AwardList.propTypes = {
  // Awards to display in the list
  awards: PropTypes.array.isRequired,
}

export default AwardList

export const getServerSideProps = async () => {
  const awards = await getCollection("awards")
  const breadcrumbs = await buildBreadcrumbs(awards, "title")
  return {
    props: {
      awards: awards["@graph"],
      pageContext: { title: awards.title },
      breadcrumbs,
    },
  }
}
