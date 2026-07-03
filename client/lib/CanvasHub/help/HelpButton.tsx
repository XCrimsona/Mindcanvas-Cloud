import "./help.css";
import { DivClass } from "../../ui/Div";
import ShortText from "../../ui/ShortText";
import RouteLink from "../../components/ProductSection/RouteLink";
import { useParams } from "react-router-dom";
const HelpButton = () => {
  const { userid, canvaid } = useParams();
  return (
    <DivClass className={"help-container"}>
      <DivClass className={"help-btn-wrapper"}>
        <ShortText className={"help-text"}>
          <RouteLink
            className="help-route"
            href={`${import.meta.env.VITE_FRONTEND_URL}/account/${userid}/canvas-management/${canvaid}/academy`}
          >
            Help
          </RouteLink>
        </ShortText>
      </DivClass>
    </DivClass>
  );
};

export default HelpButton;
