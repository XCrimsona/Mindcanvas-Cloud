import { DivClass } from "../ui/Div";

export const ImmutableList = ({ data }: any) => {
  return <p className={"textarea"}>{data.text}</p>;
};

export const MutableList = ({ data }: any) => {
  return (
    <DivClass className={"list-input"}>
      <input
        type="text"
        className={"list-text-input"}
        value={data.text}
        minLength={1}
        maxLength={10000}
      />
    </DivClass>
  );
};
