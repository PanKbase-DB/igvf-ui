// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useRef } from "react";
// components
import { DataAreaTitle, DataAreaTitleLink } from "./data-area";
import { DataGridContainer } from "./data-grid";
import { FileAccessionAndDownload } from "./file-download";
import ScrollIndicators from "./scroll-indicators";
import SortableGrid from "./sortable-grid";
import Status from "./status";
import TableCount from "./table-count";
// lib
import { dataSize, truthyOrZero } from "../lib/general";

const filesColumns = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }) => <FileAccessionAndDownload file={source} />,
  },
  {
    id: "file_format",
    title: "File Format",
  },
  {
    id: "content_type",
    title: "Content Type",
  },
  {
    id: "lab",
    title: "Lab",
    display: ({ source }) => source.lab?.title,
  },
  {
    id: "file_size",
    title: "File Size",
    display: ({ source }) =>
      truthyOrZero(source.file_size) ? dataSize(source.file_size) : "",
  },
  {
    id: "status",
    title: "Status",
    display: ({ source }) => {
      return <Status status={source.status} />;
    },
  },
  {
    id: "upload_status",
    title: "Upload Status",
    display: ({ source }) => <Status status={source.upload_status} />,
  },
];

/**
 * Display a sortable table of the given files.
 */
export default function FileTable({ files, title = "Files", itemPath = "" }) {
  const gridRef = useRef(null);

  const reportLink = itemPath
    ? `/multireport/?type=File&file_set=${encodeURIComponent(itemPath)}`
    : "";

  return (
    <>
      <DataAreaTitle>
        {title}
        <DataAreaTitleLink
          href={reportLink}
          label="Report of files that have this item as their file set"
        >
          <TableCellsIcon className="h-4 w-4" />
        </DataAreaTitleLink>
      </DataAreaTitle>
      <TableCount count={files.length} />
      <ScrollIndicators gridRef={gridRef}>
        <DataGridContainer ref={gridRef}>
          <SortableGrid data={files} columns={filesColumns} keyProp="@id" />
        </DataGridContainer>
      </ScrollIndicators>
    </>
  );
}

FileTable.propTypes = {
  // Files to display
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Title for the table; can be a string or a React component
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  // Path to the page containing the file table; used for the report link
  itemPath: PropTypes.string,
};
