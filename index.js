import alfy from "alfy";
import { queryAsync } from "./history.js";
import fzy from "fzy.js";
import _ from "lodash";
const { sortBy } = _;

const ICON_PATH = "./icon.png";
const OUTPUT_LIMIT = 15;

const fzyQuery = (alfy.input ?? "").trim();
const historyItems = await queryAsync();
let results = historyItems.filter((item) =>
  fzy.hasMatch(fzyQuery, item.content)
);
results = sortBy(results, (item) => -fzy.score(fzyQuery, item.content));

const outputItems = results.slice(0, OUTPUT_LIMIT).map((item) => {
  const positions = fzy.positions(fzyQuery, item.content);
  const subtitle = item.content.substring(
    positions[0],
    positions[positions.length - 1] + 1
  );
  return {
    uid: item.id,
    title: item.content,
    subtitle,
    arg: item.content,
    icon: { path: ICON_PATH },
    mods: {
      cmd: {
        arg: item.content,
        subtitle: `Copy & Paste '${item.content}' `,
      },
    },
  };
});

alfy.output(outputItems);
