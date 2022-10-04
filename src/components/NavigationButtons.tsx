import { Moment } from "moment";
import { Left, Right } from "@navikt/ds-icons";
import { Button } from "@navikt/ds-react";
import styled from "styled-components";
import moment from "moment";
import { useState, useEffect, Dispatch, SetStateAction } from "react";

const NavigateBtn = styled.div`
  position: absolute;
  display: inline-block;
  z-index: 2;
  margin-right: 1px;
  right: 0px;
  background-color: #0067c5;
  height: 31.5px;
  top: 0px;
`;

const Timeframebtns = styled.div`
  display: inline-block;
  margin-top: -10px;
  position: relative;
  top: -5px;
`;

export const NavigationButtons = (props: {
  timeStart: number;
  timeEnd?: number;
  timeUnit: string;
  setVisibleTimeStart: Dispatch<SetStateAction<number>>;
  setVisibleTimeEnd: Dispatch<SetStateAction<number>>;
  setTimeUnit: Dispatch<SetStateAction<string>>;
}) => {
  const onPrevClick = () => {
    if (props.timeUnit === "week") {
      let newVisibleTimeStart = moment(props.timeStart)
        .add(-1, "week")
        .startOf("week")
        .valueOf();
      let newVisibleTimeEnd = moment(props.timeStart)
        .add(-1, "week")
        .endOf("week")
        .valueOf();
      props.setVisibleTimeStart(newVisibleTimeStart);
      props.setVisibleTimeEnd(newVisibleTimeEnd);
    }
    if (props.timeUnit === "month") {
      let newVisibleTimeStart = moment(props.timeStart)
        .add(-1, "month")
        .startOf("month")
        .valueOf();
      let newVisibleTimeEnd = moment(props.timeStart)
        .add(-1, "month")
        .endOf("month")
        .valueOf();
      props.setVisibleTimeStart(newVisibleTimeStart);
      props.setVisibleTimeEnd(newVisibleTimeEnd);
    }
    if (props.timeUnit === "year") {
      let newVisibleTimeStart = moment(props.timeStart)
        .add(-1, "year")
        .startOf("year")
        .valueOf();
      let newVisibleTimeEnd = moment(props.timeStart)
        .add(-1, "year")
        .endOf("year")
        .valueOf();
      props.setVisibleTimeStart(newVisibleTimeStart);
      props.setVisibleTimeEnd(newVisibleTimeEnd);
    }
  };

  const onNextClick = () => {
    if (props.timeUnit === "week") {
      let newVisibleTimeStart = moment(props.timeStart)
        .add(1, "week")
        .startOf("week")
        .valueOf();
      let newVisibleTimeEnd = moment(props.timeStart)
        .add(1, "week")
        .endOf("week")
        .valueOf();
      props.setVisibleTimeStart(newVisibleTimeStart);
      props.setVisibleTimeEnd(newVisibleTimeEnd);
    }
    if (props.timeUnit === "month") {
      let newVisibleTimeStart = moment(props.timeStart)
        .add(1, "month")
        .startOf("month")
        .valueOf();
      let newVisibleTimeEnd = moment(props.timeStart)
        .add(1, "month")
        .endOf("month")
        .valueOf();
      props.setVisibleTimeStart(newVisibleTimeStart);
      props.setVisibleTimeEnd(newVisibleTimeEnd);
    }
    if (props.timeUnit === "year") {
      let newVisibleTimeStart = moment(props.timeStart)
        .add(1, "year")
        .startOf("year")
        .valueOf();
      let newVisibleTimeEnd = moment(props.timeStart)
        .add(1, "year")
        .endOf("year")
        .valueOf();
      props.setVisibleTimeStart(newVisibleTimeStart);
      props.setVisibleTimeEnd(newVisibleTimeEnd);
    }
  };

  const handleTimeHeaderChange = (unit: string) => {
    props.setTimeUnit(unit);

    if (unit === "day") {
      props.setVisibleTimeStart(moment().startOf("day").valueOf());
      props.setVisibleTimeEnd(moment().endOf("day").valueOf());
    }
    if (unit === "week") {
      props.setVisibleTimeStart(moment().startOf("week").valueOf());
      props.setVisibleTimeEnd(moment().endOf("week").valueOf());
    }
    if (unit === "month") {
      props.setVisibleTimeStart(moment().startOf("month").valueOf());
      props.setVisibleTimeEnd(moment().endOf("month").valueOf());
    }
    if (unit === "year") {
      props.setVisibleTimeStart(moment().startOf("year").valueOf());
      props.setVisibleTimeEnd(moment().endOf("year").valueOf());
    }
  };
  return (
    <NavigateBtn>
      <Timeframebtns>
        <Button size="small" onClick={() => handleTimeHeaderChange("day")}>
          Dag
        </Button>
        <Button size="small" onClick={() => handleTimeHeaderChange("week")}>
          Uke
        </Button>
        <Button size="small" onClick={() => handleTimeHeaderChange("month")}>
          Måned
        </Button>
        <Button size="small" onClick={() => handleTimeHeaderChange("year")}>
          År
        </Button>
      </Timeframebtns>
      <Button size="small" onClick={() => onPrevClick()} icon={<Left />} />
      <Button size="small" onClick={() => onNextClick()} icon={<Right />} />
    </NavigateBtn>
  );
};
