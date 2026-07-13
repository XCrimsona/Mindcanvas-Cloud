import React, { useState } from "react";
import Button from "../../components/form-elements/Button";
import { DivClass } from "../../ui/Div";
import { EnabledTextAreaInput } from "../../components/media-retrieved-components/MediaInputComponents";
import Label from "../../components/form-elements/Label";
import { useFormComponentToggle } from "../FormComponentToggleContext";
import { useCanvasFragmentData } from "../../canvas-data/CanvasFragmentDataContext";
import useFormComponentDrag from "../useFormComponentDrag";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./doughnutchart.css";
import { redirectToSignIn } from "../../auth-redirect/AuthRedirectContext";

const DoughnutChartInputUnit = () => {
  try {
    const { userid, canvaid } = useParams();
    if (!userid) {
      return;
    } else {
      //normal path — continue rendering
    }
    const {
      setDoughnutChartToggle,
      doughnutChartInputCompPosRef,
      doughnutChartInputCompRef,
      doughnutChartToggle,
    } = useFormComponentToggle();
    const { updateCanvasData } = useCanvasFragmentData();

    const { handlePointerDown, handlePointerMove, handlePointerUp } =
      useFormComponentDrag({
        elementRef: doughnutChartInputCompRef,
        positionRef: doughnutChartInputCompPosRef,
        isOpen: doughnutChartToggle,
      });

    const [newDoughnutChartComponent, setNewDoughnutChartComponent] =
      useState<any>({
        label: "",
        labels: "",
        listOfBackgroundColors: "",
        listOfNumericValues: "",
      });

    const [selectedType, setSelectedType] = useState<string>("DoughnutChart");

    const chartComponentFormData = async (
      event: React.FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      const chartFormData: any = {};
      if (selectedType) {
        chartFormData.type = selectedType;
      } else {
        //no type selected
      }
      if (doughnutChartInputCompPosRef.current.x >= 0) {
        chartFormData.x = doughnutChartInputCompPosRef.current.x;
      } else {
        //negative x
      }
      if (doughnutChartInputCompPosRef.current.y >= 0) {
        chartFormData.y = doughnutChartInputCompPosRef.current.y;
      } else {
        //negative y
      }
      if (newDoughnutChartComponent.label) {
        chartFormData.label = newDoughnutChartComponent.label;
      } else {
        //no label
      }

      const parseCSV = (str: string) =>
        str.split(",").map((item) => item.trim());
      const parseNumber = (str: string) =>
        str.split(",").map((item) => Number(item.trim()));

      if (newDoughnutChartComponent.labels) {
        chartFormData.labels = parseCSV(newDoughnutChartComponent.labels);
      } else {
        //no labels
      }

      if (newDoughnutChartComponent.listOfNumericValues) {
        const toStrValArray = parseNumber(
          newDoughnutChartComponent.listOfNumericValues,
        );
        chartFormData.listOfNumericValues = toStrValArray;
      } else {
        //no numeric values
      }
      if (newDoughnutChartComponent.listOfBackgroundColors) {
        const toNumberValArray = parseCSV(
          newDoughnutChartComponent.listOfBackgroundColors,
        );
        chartFormData.listOfBackgroundColors = toNumberValArray;
      } else {
        //no background colors
      }

      chartFormData.borderColor = [
        "rgba(0,0,0, 1)",
        "rgba(0,0,0, 1)",
        "rgba(0,0,0, 1)",
      ];
      chartFormData.borderWidth = 0;
      chartFormData.hoverOffset = 10;
      chartFormData.offset = 10;

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
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
        toast.success("DoughnutChart form must be filled with suffcient data");
        return;
      } else {
        const text = await fetch(
          `${import.meta.env.VITE_API_URL}/api/account/${userid}/canvas-management/${canvaid}`,
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
          if (errorData.message === "Not Authenticated") {
            redirectToSignIn();
          } else {
            //non-auth failure — surface toast below
          }
          toast.error(
            "DoughnutChart fragment was not added: " + errorData.message,
          );
        }
      }
    };

    return (
      doughnutChartToggle && (
        <div
          className={"data-doughnutchart-component"}
          ref={doughnutChartInputCompRef}
          style={{
            position: "absolute",
            left: `${doughnutChartInputCompPosRef.current.x}px`,
            top: `${doughnutChartInputCompPosRef.current.y}px`,
            color: "#fff",
            cursor: "move",
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
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
