import CanvaComponent from "./CanvaContainer/CanvasWrapper";
import { CanvasFragmentDataProvider } from "../../../../../lib/canvas-data/CanvasFragmentDataContext";
import { FormComponentToggleProvider } from "../../../../../lib/form-components/FormComponentToggleContext";

const CanvaPage = () => {
  return (
    <CanvasFragmentDataProvider>
      <FormComponentToggleProvider>
        <CanvaComponent />
      </FormComponentToggleProvider>
    </CanvasFragmentDataProvider>
  );
};

export default CanvaPage;
