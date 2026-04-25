import { Chart as ChartTsx, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import DoughnutChartClass from "./Chart.module.css";
//text input unit. Not the output styling
import { useModificationContext } from "../../modify-data/InfoModificationContextProvider";
import { DivClass } from "../../ui/Div";
import { EditWindow } from "../../modify-data/EditWindow";
import { ModificationWindow } from "../../modify-data/ModificationWindow";
import { SpanFragment } from "../../ui/spanElement";
import "../i-menu-selector.css";
import { useCanvasContext } from "../../form-components/canva-data-provider/CanvasDataContextProvider";
import ShortText from "../../ui/ShortText";
import HeadingThree from "../../ui/HeadingThree";
import "../../form-components/chart/doughnutchart.css";

ChartTsx.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ data }: { data: any }) => {
  const dataset = data.datasets?.[0];
  const labelsAndDatasets = {
    labels: data.labels,
    datasets: [
      {
        label: dataset?.label,
        data: dataset?.data,
        backgroundColor: dataset?.backgroundColor,
        borderColor: dataset?.borderColor,
        borderWidth: dataset?.borderWidth,
        hoverOffset: 0,
      },
    ],
  };

  const option = data.options;
  const optionData = {
    responsive: false,
    maintainAspectRatio: option?.maintainAspectRatio, // important for dashboards
    cutout: "60%", // makes it a proper doughnut (not pie)
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        //built a custom legend UI below the chart
      },
    },
  };

  const { _id, type } = data;
  const {
    modificationWindow,
    selectedComp,
    setSelectedComp,
    editState,
    moveFragment,
    setModificationWindow,
  } = useModificationContext();
  const { setRepositionWindow } = useCanvasContext();

  const selectFragmentId = (e: React.MouseEvent<HTMLButtonElement>) => {
    const dataFragmentId = String((e.target as HTMLElement).id);
    setSelectedComp({
      dataFragmentId: dataFragmentId,
      type: type,
      info: "",
    });
    moveFragment(e);
    return;
  };

  const ChartMetric = (props: any) => {
    return (
      <div className={DoughnutChartClass.chartmetric}>
        <div className="flex justify-start  mt-2 mb-2 ">
          <span
            style={{
              display: "inline-block",
              height: 20,
              width: 20,
              backgroundColor: props.color,
              borderRadius: 20,
              marginRight: 6,
            }}
          ></span>
          <ShortText className={DoughnutChartClass.shortdescription}>
            {/* custom legend UI will gain better ux input in the future */}
            {props.data}, Score: {props.label}
          </ShortText>
        </div>
      </div>
    );
  };

  //this whole component will have preset dropdown values from the input Chart UI to select the size of the chart UI after creation
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
      <DivClass className={DoughnutChartClass.chartfragmentdashboard}>
        <div
          id={`${data._id}`}
          className={DoughnutChartClass.doughnutchartcontainer}
        >
          <SpanFragment
            id={`${data._id}`}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              selectFragmentId(e);
              setRepositionWindow(false);
              setModificationWindow(true);
              //style={{
              //  problem with below line: once toggle all would be fixed. Id ref require dto make fixed position
              //  position: `${pinnedText === true ? "fixed" : "absolute"}`,
              //}}
            }}
            className="i-note-drop-down"
          >
            i
          </SpanFragment>
          <div className={DoughnutChartClass.parentchartcontainer}>
            <div className={DoughnutChartClass.childchartcontainer}>
              <HeadingThree
                id={`${data._id}-chart-heading`}
                className={DoughnutChartClass.font20 + " block text-center"}
              >
                {dataset?.label}
              </HeadingThree>
              <Doughnut
                className={DoughnutChartClass.doughnutchart}
                data={labelsAndDatasets}
                options={optionData}
              />
              <div className={DoughnutChartClass.chartmetrics}>
                {dataset?.data.map((dataValue: any, index: number) => {
                  const label = data.labels[index];
                  const color = dataset.backgroundColor[index];

                  return (
                    <ChartMetric
                      key={`${_id}-chart-${index}`} // unique key
                      label={label}
                      data={dataValue}
                      color={color}
                    />
                  );
                })}
              </div>
              <div className={DoughnutChartClass.aisummary}>
                <p className={DoughnutChartClass.aisummarytext}>
                  AI Metrics come here. For now do manuals
                </p>
              </div>
            </div>
            <div className={DoughnutChartClass.addchartcontainer}>
              <button
                id={_id}
                onClick={() => {
                  // my latest talk will apply here using the _id of this uniquely identitfied component
                }}
                className={DoughnutChartClass.addchart}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </DivClass>
    </>
  );
};

export default DoughnutChart;
