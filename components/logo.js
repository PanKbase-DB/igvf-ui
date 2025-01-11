// node_modules
import _ from "lodash";
import Image from "next/image";
import Link from "next/link";

/**
 * Height and width of collection logos in pixels. PNG or JPEG files should have double this
 * resolution to appear crisp on retina displays. SVG files should keep these proportions. Many of
 * the existing SVG logos are 210px wide by 140px tall just to be a bit easier to work with in
 * Illustrator. Where possible, use SVG files to avoid the need for double-resolution PNG files,
 * and make sure they contain SVG elements, not links to external PNG files. Illustrator can help
 * determine this.
 *
 * Where possible, use SVG and PNG files with no background color, as this component displays them
 * on a white background, or very light gray in dark mode.
 *
 * The graphic within the 105x70 box should have a maximum width of 95px and a maximum height of
 * 60px.
 */
const LOGO_WIDTH = 225;
const LOGO_HEIGHT = 69;
// node_modules
export function Logo() {
  return (
    <div className="logo-container">
      <Image
        src="https://hugeampkpncms.org/sites/default/files/users/user32/pankbase/PanKbase_logo-black-tagline.svg"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        alt="PanKbase Logo"
        priority
      />
    </div>
  );
}

export default function SiteLogo() {
  return (
    <Link
      href="https://pankbase.org"
      className="block w-10 py-2 md:h-auto md:w-auto md:px-8"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Logo />
      <span className="sr-only">Home</span>
    </Link>
  );
}
