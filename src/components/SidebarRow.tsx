import styled from "styled-components";
import Label from "@navikt/ds-react";

const GrpNameWrapper = styled.div.attrs(
  (props: { leftPosition?: number }) => props
)`
  display: inline-block;
  padding-left: ${(props) => props.leftPosition}px;
`;

const SidebarRow = (props: { grpName: string }) => {
  return (
    <>
      <GrpNameWrapper>
        <Label size="medium">{props.grpName}</Label>
      </GrpNameWrapper>
    </>
  );
};

export default SidebarRow;
