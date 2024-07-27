// node_modules
import { EnvelopeIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
// components
import Icon from "./icon";
import SessionContext from "./session-context";
// lib
import { UI_VERSION } from "../lib/constants";
import FetchRequest from "../lib/fetch-request";

/**
 * Display the igvf-ui and igvfd version numbers.
 */
function Versions({ serverVersion = "" }) {
  const versions = [];
  if (UI_VERSION) {
    versions.push(
      <div key="ui" data-testid="version-ui">{`UI:${UI_VERSION}`}</div>
    );
  }
  if (serverVersion) {
    versions.push(
      <div
        key="server"
        data-testid="version-server"
      >{`Server:${serverVersion}`}</div>
    );
  }

  if (versions.length > 0) {
    return (
      <div className="flex gap-2 text-xs font-semibold text-brand">
        {versions}
      </div>
    );
  }
  return null;
}

Versions.propTypes = {
  // Server version number
  serverVersion: PropTypes.string,
};

/**
 * Display email link.
 */
export function Email() {
  return (
    <div>
      <a
        className="block"
        href="mailto:help@pankbase.org"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Email the PanKbase help desk"
      >
        <EnvelopeIcon className="h-6 w-6 fill-brand" />
      </a>
    </div>
  );
}

/**
 * Display eTwitter links.
 */
export function Twitter() {
  return (
    <div>
      <a
        className="block"
        href="https://twitter.com/PanKbase"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="PanKbase Consortium on X"
      >
        <Icon.Twitter className="h-6 w-6" />
      </a>
    </div>
  );
}

export default function SiteInfo() {
  const { session } = useContext(SessionContext);
  // Server software release version
  const [serverVersion, setServerVersion] = useState("");

  useEffect(() => {
    async function fetchServerVersion() {
      const request = new FetchRequest({ session });
      const root = (await request.getObject("/")).optional();
      const rootServerVersion = root?.app_version || "";
      if (rootServerVersion) {
        setServerVersion(rootServerVersion);
      }
    }

    if (!serverVersion && session) {
      fetchServerVersion();
    }
  }, [session]);

  return (
    <section>
      <Versions serverVersion={serverVersion} />
    </section>
  );
}
