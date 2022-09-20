var tinycolor = require("tinycolor2");

let colors: string[] = [
  "#FDE3DB",
  "#F6FDDB",
  "#E5F4F5",
  "#EFE9F4",
  "#FDEBDB",
  "#F0F8EA",
  "#E2F6FF",
  "#FBEDFF",
  "#FDF3DB",
  "#E4F6ED",
  "#E2F0FF",
  "#FFEAF7",
  "#FEFFD7",
  "#D9F5F4",
  "#E2E3FF",
  "#FFEAEC",
];

export const RandomColor: any = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};

export const BorderColor: any = () => {
  return tinycolor(RandomColor()).darken(20).toString();
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
