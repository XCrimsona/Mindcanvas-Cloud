import React, { useLayoutEffect, useState } from "react";
import Button from "../../components/form-elements/Button";
import { DivClass } from "../../ui/Div";
import { EnabledTextAreaInput } from "../../components/media-retrieved-components/MediaInputComponents";
import Label from "../../components/form-elements/Label";
import { useCanvasContext } from "../canva-data-provider/CanvasDataContextProvider";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./doughnutchart.css";

const DoughnutChartInputUnit = () => {
  try {
    const { userid, canvaid } = useParams();
    if (!userid) return;
    //activates text input form
    const {
      dataScrollBoardRef,
      globalDraggingRef,
      doughnutChartInputOffSet,
      setDoughnutChartToggle,
      //useref used to control the element's left with x and top with y canvas coordinates
      doughnutChartInputCompPosRef,
      doughnutChartInputCompRef,
      hasInitializedPositionRef,
      doughnutChartToggle,
      updateCanvasData,
    } = useCanvasContext();

    //Determines the web app width and height as perceived on screen and centers this exact file's UI in the middle of the screen.
    //It also re-centers by collraborating with another useEffect function which checks the boolean value to toggle the UI.
    useLayoutEffect(() => {
      if (
        !doughnutChartToggle ||
        hasInitializedPositionRef.current ||
        !dataScrollBoardRef.current ||
        !doughnutChartInputCompRef.current
      )
        return;

      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();
      const doughnutChartInputElementRect =
        doughnutChartInputCompRef.current.getBoundingClientRect();

      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      const canvasX =
        viewportCenterX -
        boardRect.left -
        doughnutChartInputElementRect.width / 2;
      const canvasY =
        viewportCenterY -
        boardRect.top -
        doughnutChartInputElementRect.height / 2;

      //clamp to keep the elements inside the canvas
      const boundedX = Math.max(
        0,
        Math.min(
          canvasX,
          boardRect.width - doughnutChartInputElementRect.width,
        ),
      );
      const boundedY = Math.max(
        0,
        Math.min(
          canvasY,
          boardRect.height - doughnutChartInputElementRect.height,
        ),
      );

      const doughnutChartInputElement =
        doughnutChartInputCompRef.current as HTMLDivElement;

      //center doughnutChartInputUnit
      if (doughnutChartInputElement) {
        doughnutChartInputElement.style.left = `${boundedX}px`;
        doughnutChartInputElement.style.top = `${boundedY}px`;
      }

      hasInitializedPositionRef.current = true;
    }, [doughnutChartToggle]);

    // const { newDoughnutChartComponent, setNewDoughnutChartComponent } = useNewDoughnutChartComponent();
    const [newDoughnutChartComponent, setNewDoughnutChartComponent] =
      useState<any>({
        label: "",
        labels: "",
        listOfBackgroundColors: "",
        listOfNumericValues: "",
      });

    const [selectedType, setSelectedType] = useState<string>("DoughnutChart");

    //submit text Data
    const chartComponentFormData = async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      //Checks if doughnutChartInputCompPosRef,newDoughnutChartComponent and selectedType are not null
      const chartFormData: any = {};
      if (selectedType) chartFormData.type = selectedType;
      //coordinates of where on the canvas the chart will be placed.
      if (doughnutChartInputCompPosRef.current.x >= 0) {
        chartFormData.x = doughnutChartInputCompPosRef.current.x;
      }
      if (doughnutChartInputCompPosRef.current.y >= 0) {
        chartFormData.y = doughnutChartInputCompPosRef.current.y;
      }
      if (newDoughnutChartComponent.label) {
        chartFormData.label = newDoughnutChartComponent.label;
      }

      const parseCSV = (str: string) =>
        str.split(",").map((item) => item.trim()); //split by comma and trim whitespace
      const parseNumber = (str: string) =>
        str.split(",").map((item) => Number(item.trim())); //split by comma and trim whitespace

      if (newDoughnutChartComponent.labels) {
        chartFormData.labels = parseCSV(newDoughnutChartComponent.labels);
      }

      if (newDoughnutChartComponent.listOfNumericValues) {
        const toStrValArray = parseNumber(
          newDoughnutChartComponent.listOfNumericValues,
        );

        chartFormData.listOfNumericValues = toStrValArray;
      }
      if (newDoughnutChartComponent.listOfBackgroundColors) {
        const toNumberValArray = parseCSV(
          newDoughnutChartComponent.listOfBackgroundColors,
        );

        chartFormData.listOfBackgroundColors = toNumberValArray;
      }

      chartFormData.borderColor = [
        "rgba(0,0,0, 1)",
        "rgba(0,0,0, 1)",
        "rgba(0,0,0, 1)",
      ];
      chartFormData.borderWidth = 0; //no border needed for now
      chartFormData.hoverOffset = 10; //can be changed in the future
      chartFormData.offset = 10; //can be changed in the future

      //for now the options are defaulted to non-changeable values, but in the future this change
      const options = {
        responsive: true,
        maintainAspectRatio: false, // important for dashboards
        cutout: "60%", // makes it a proper doughnut (not pie)
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxHeight: 14,
              boxWidth: 14,
              font: { size: 12 },
              color: "#fff",
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            borderColor: "rgba(250, 170, 0, 0.251)",
            borderWidth: 1,
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
          },
        },
      };
      chartFormData.options = options;
      if (
        !chartFormData.type &&
        !chartFormData.x &&
        !chartFormData.y &&
        !chartFormData.labels &&
        !chartFormData.label &&
        !chartFormData.listOfBackgroundColors &&
        !chartFormData.listOfNumericValues
      ) {
        //fires when the logic breaks
        toast.success("DoughnutChart form must be filled with suffcient data");
        return;
      } else {
        const text = await fetch(
          `http://localhost:5000/api/account/${userid}/canvas-management/${canvaid}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(chartFormData),
          },
        );
        if (text.ok) {
          toast.success("DoughnutChart data fragment created");
          updateCanvasData();
        } else {
          const errorData = await text.json();
          toast.success(
            "DoughnutChart fragment was not added: " + errorData.message,
          );
        }
      }
    };

    const processDoughnutChartMouseMove = (event: React.MouseEvent) => {
      if (
        !globalDraggingRef.current ||
        !dataScrollBoardRef.current ||
        !doughnutChartInputCompRef.current
      )
        return;

      const doughnutChartInputElement =
        doughnutChartInputCompRef.current as HTMLDivElement;
      const doughnutChartInputElementRect =
        doughnutChartInputElement.getBoundingClientRect();
      const boardRect = dataScrollBoardRef.current.getBoundingClientRect();

      //mouse position inside the board
      const mouseInsideBoardX = event.clientX - boardRect.left;
      const mouseInsideBoardY = event.clientY - boardRect.top;

      //When we first click down, we store how far from the element's left and top the mouse was (doughnutChartInputOffSet.current.x/y)
      const newXElementLeft =
        mouseInsideBoardX - doughnutChartInputOffSet.current.x;
      const newYElementTop =
        mouseInsideBoardY - doughnutChartInputOffSet.current.y;

      // set boundaries so draggables dont go outside the drag frame
      const newPosX = Math.max(
        0,
        Math.min(
          newXElementLeft,
          boardRect.width - doughnutChartInputElementRect.width,
        ),
      );

      const newPosY = Math.max(
        0,
        Math.min(
          newYElementTop,
          boardRect.height - doughnutChartInputElementRect.height,
        ),
      );

      doughnutChartInputCompPosRef.current = {
        x: newPosX,
        y: newPosY,
      };

      if (doughnutChartInputElement) {
        doughnutChartInputElement.style.left = `${doughnutChartInputCompPosRef.current.x}px`;
        doughnutChartInputElement.style.top = `${doughnutChartInputCompPosRef.current.y}px`;
      }
    };
    const processDoughnutChartMouseUp = () => {
      globalDraggingRef.current = false;
      document.removeEventListener<any>(
        "mousemove",
        processDoughnutChartMouseMove,
      );
      document.removeEventListener<any>("mouseup", processDoughnutChartMouseUp);
      doughnutChartInputOffSet.current = {
        x: doughnutChartInputCompPosRef.current.x,
        y: doughnutChartInputCompPosRef.current.y,
      };
    };
    const processDoughnutChartMouseDown = (
      event: React.MouseEvent<HTMLDivElement>,
    ) => {
      globalDraggingRef.current = true;
      const doughnutchartElement =
        doughnutChartInputCompRef.current as HTMLDivElement;
      const doughnutchartElementRect =
        doughnutchartElement.getBoundingClientRect();
      //Store where inside the element-doughnutchartui the click happened
      doughnutChartInputOffSet.current = {
        x: event.clientX - doughnutchartElementRect.left,
        y: event.clientY - doughnutchartElementRect.top,
      };
      document.addEventListener<any>(
        "mousemove",
        processDoughnutChartMouseMove,
      );
      document.addEventListener<any>("mouseup", processDoughnutChartMouseUp);
    };

    //pin feature here has a double toggle bug, issue is not the end of the world altough its irritating

    //demo
    // const chartColors = [
    //   "rgba(250, 170, 0, 0.5)",
    //   "rgba(250, 170, 0, 0.8)",
    //   "rgba(250, 170, 0, 0.7)",
    //   "rgba(101, 81, 38, 1)",
    // ];

    // const chartData = [35, 25, 20, 20];
    return (
      doughnutChartToggle && (
        // add the pin true false feature
        <div
          className={"data-doughnutchart-component"}
          ref={doughnutChartInputCompRef}
          style={{
            //DO NOT PUT THE PIN FEATURE HERE
            position: "absolute",
            left: `${doughnutChartInputCompPosRef.current.x}px`,
            top: `${doughnutChartInputCompPosRef.current.y}px`,
            color: "#fff",
          }}
          onMouseDown={processDoughnutChartMouseDown}
        >
          <div className="absolute top-2 z-11 right-2 h-15 w-5 ">
            <span
              className="block  cursor-pointer"
              onClick={() => setDoughnutChartToggle(false)}
            >
              ✕
            </span>
          </div>
          <form
            className={"doughnutchart-input-form"}
            onSubmit={chartComponentFormData}
          >
            <DivClass className={"doughnut-chart-label-wrapper"}>
              <Label
                htmlfor="enabled-doughnut-chart-input-field"
                className={"doughnut-chart-label"}
                text="Create Doughnut Chart"
              />
            </DivClass>
            <DivClass className={"text-container"}>
              <DivClass className={"text-input-wrapper"}>
                {selectedType === "DoughnutChart" ? (
                  <>
                    <EnabledTextAreaInput
                      id="enabled-text-input-field"
                      className={"enabled-text-input-field"}
                      placeholder="e.g Color analytics"
                      value={newDoughnutChartComponent.label}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setNewDoughnutChartComponent({
                          ...newDoughnutChartComponent,
                          label: e.target.value,
                        });
                      }}
                    />
                    <EnabledTextAreaInput
                      id="enabled-text-input-field"
                      className={"enabled-text-input-field"}
                      placeholder="e.g List, of, Dashboard, Metrics"
                      value={newDoughnutChartComponent.labels}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setNewDoughnutChartComponent({
                          ...newDoughnutChartComponent,
                          labels: e.target.value,
                        });
                      }}
                    />
                    <EnabledTextAreaInput
                      id="enabled-text-input-field"
                      className={"enabled-text-input-field"}
                      placeholder="e.g #ff0000, #00ff00, #0000ff"
                      value={newDoughnutChartComponent.listOfBackgroundColors}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setNewDoughnutChartComponent({
                          ...newDoughnutChartComponent,
                          listOfBackgroundColors: e.target.value,
                        });
                      }}
                    />
                    <EnabledTextAreaInput
                      id="enabled-text-input-field"
                      className={"enabled-text-input-field"}
                      placeholder="e.g 10, 20, 30"
                      value={newDoughnutChartComponent.listOfNumericValues}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setNewDoughnutChartComponent({
                          ...newDoughnutChartComponent,
                          listOfNumericValues: e.target.value,
                        });
                      }}
                    />
                  </>
                ) : (
                  <EnabledTextAreaInput
                    id="enabled-doughnut-chart-input-field"
                    className={"enabled-doughnut-chart-input-field"}
                    placeholder="Don't use - Under construction"
                    value={newDoughnutChartComponent.doughnutchart}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      setNewDoughnutChartComponent({
                        ...newDoughnutChartComponent,
                        doughnutchart: e.target.value,
                      });
                    }}
                  />
                )}
                <DivClass className={"doughnutchart-btn-container"}>
                  <DivClass className={"doughnutchart-submit-btn-container"}>
                    <Button
                      id="doughnutchart-btn-submit"
                      className={"doughnutchart-btn-submit"}
                    >
                      SAVE
                    </Button>
                  </DivClass>
                  <DivClass className={"doughnutchart-selection-wrapper"}>
                    <div className="radio-group">
                      <input
                        type="radio"
                        checked
                        id="doughnutchart-type-option-one"
                        className={"doughnutchart-type-option-one"}
                        // value={"Doughnut Chart"}
                        onChange={() => {
                          setSelectedType("DoughnutChart");
                        }}
                        name="layout-format"
                      />
                      <label
                        className="doughnutchart-type-label"
                        htmlFor="doughnutchart-type-option-one"
                      >
                        Doughnut Chart
                      </label>
                    </div>
                  </DivClass>
                </DivClass>
              </DivClass>
            </DivClass>
          </form>
        </div>
      )
    );
  } catch (error) {
    console.warn("Error in DoughnutChartInputUnit: ", error);
    return (
      <DivClass className={"erro-message"}>
        An error occurred while loading the doughnut chart input unit.
      </DivClass>
    );
  }
};

export default DoughnutChartInputUnit;
