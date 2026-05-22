import { useModificationContext } from "../../modify-data/InfoModificationContextProvider";
import Button from "../form-elements/Button";
import "./reading-page.css";

const ReadingPage = () => {
  const {
    readingPageOpen,
    readingPageDataRef,
    closeReadingPage,
    setModificationWindow,
  } = useModificationContext();

  if (!readingPageOpen) return null;

  const payload = readingPageDataRef.current;
  if (!payload) return null;

  const { id, data } = payload;
  const body = data?.text ?? "";
  const link = data?.link ?? "";

  return (
    <div className="a4-reading-overlay">
      <div className="a4-reading-sheet" id={`a4-reading-${id}`}>
        <div className="a4-reading-toolbar">
          <Button
            id={`a4-reading-close-${id}`}
            className="a4-reading-close-button"
            onClick={() => {
              closeReadingPage();
              setModificationWindow(true);
            }}
          >
            Close reading page
          </Button>
        </div>
        <article className="a4-reading-body">
          <p className="a4-reading-text">{body}</p>
          {link && (
            <a
              className="a4-reading-link"
              href={link}
              target="_blank"
              rel="noreferrer"
            >
              {link}
            </a>
          )}
        </article>
      </div>
    </div>
  );
};

export default ReadingPage;
