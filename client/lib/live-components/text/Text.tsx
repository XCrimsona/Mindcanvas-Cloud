import { TextFragment } from "../../ui/LongText";
//text input unit. Not the output styling
import { useModificationContext } from "../../modify-data/InfoModificationContextProvider";
import { DivClass } from "../../ui/Div";
import { EditWindow } from "../../modify-data/EditWindow";
import { ModificationWindow } from "../../modify-data/ModificationWindow";
import { SpanFragment } from "../../ui/spanElement";
import "../../form-components/text/text.css";
import "../i-menu-selector.css";
import "./text-data-styling.css";
import "../is-note.css";

//This component is used to display already create info TextInput is the one that creates text
export const Text = ({ data }: { data: any }) => {
  const { _id, type } = data;
  const {
    modificationWindow,
    selectedComp,
    setSelectedComp,
    editState,
    setModificationWindow,
  } = useModificationContext();

  const selectFragmentId = (e: React.MouseEvent<HTMLButtonElement>) => {
    const dataFragmentId = String((e.target as HTMLElement).id);
    setSelectedComp({
      dataFragmentId: dataFragmentId,
      type: type,
      info: "",
    });
    return;
  };

  return (
    <>
      {/* UI code implementation works in reverse but the css still displays 
      the context on the right next to the live data which is correct */}
      {modificationWindow && selectedComp.dataFragmentId === _id && (
        <ModificationWindow componentData={data} />
      )}
      {editState && selectedComp.dataFragmentId === _id && (
        <EditWindow componentData={data} />
      )}
      <DivClass className={"text-fragment-container"}>
        <TextFragment id={`${_id}`} className={"text-fragment"}>
          <SpanFragment
            id={`${data._id}`}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              selectFragmentId(e);
              setModificationWindow(true);
            }}
            // className="i-note-drop-down"
            className="i-note-drop-down"
          >
            i
          </SpanFragment>
          {data.text}
        </TextFragment>
      </DivClass>
    </>
  );
};
