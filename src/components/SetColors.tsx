var tinycolor = require("tinycolor2");

let colors: string[] = [
  "#EFECF4",
  "#E6F0FF",
  "#E7F8FF",
  "#EDFFF8",
  "#F4FDE8",
  "#FFFEE4",
  "#FFF6E7",
  "#FDE8E6",
];

export const colorPicker: any = (index: number) => {
  return colors[index % colors.length];
};

export const setGrpColor: any = (list: any[], itemId: string) => {
  var grpColor: string = "#FFFFFF";
  list.map((listObj: any) => {
    if (listObj.group === itemId) {
      grpColor = listObj.color;
    }
  });
  return grpColor;
};

export const setTextColor: any = (color: string) => {
  let textColor = tinycolor(color).darken(80).toString();
  return textColor;
};

export const setBorderColor: any = (color: string) => {
  let borderColor = tinycolor(color).darken(70).setAlpha(0.22).toString();
  return borderColor;
};

export const setInterruptionColor: any = (list: any[], itemId: string) => {
  var interruptionColor: string = "#FFFFFF";
  list.map((listObj: any) => {
    if (listObj.group === itemId) {
      interruptionColor = tinycolor(listObj.color).darken(10).toString();
    }
  });
  return interruptionColor;
};
