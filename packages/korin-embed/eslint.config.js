import reactInternal from "@monorepo/eslint-config/react-internal";

export default [
  ...reactInternal,
  {
    ignores: ["dist"],
  },
];
