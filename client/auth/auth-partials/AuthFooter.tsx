import Footer from "../../lib/components/Footer";
import { DivClass } from "../../lib/ui/Div";
import ShortText from "../../lib/ui/ShortText";
import "../auth-footer.css";
const AuthFooter = () => {
  return (
    <Footer id="auth-footer" className={"auth-footer"}>
      <DivClass className={"creator"}>
        <ShortText className={"project-creator"}>
          Created by Christeen Fabian | The Code Hashira
        </ShortText>
      </DivClass>
    </Footer>
  );
};

export default AuthFooter;
