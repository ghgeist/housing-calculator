import React from "react";
import { expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ResultsPanel } from "./ResultsPanel";
import { DEFAULT_INPUTS } from "../lib/defaults";
import { runModel } from "../lib/housing/model";

test("renders positive carry badge and cheaper-to-own copy", () => {
  const inputs = {
    ...DEFAULT_INPUTS,
    monthlyRent: 12_000,
  };
  const results = runModel(inputs);

  const html = renderToStaticMarkup(<ResultsPanel results={results} inputs={inputs} />);

  expect(html).toMatch(/Positive Carry/);
  expect(html).toMatch(/badge-positive/);
  expect(html).toMatch(/cheaper to own than rent/);
  expect(html).toMatch(/hero-positive/);
  expect(html).toMatch(/Total owner cash outflow/);
  expect(html).toMatch(/Money back at exit/);
});

test("renders negative carry badge and more-expensive-to-own copy", () => {
  const inputs = {
    ...DEFAULT_INPUTS,
    monthlyRent: 1_000,
  };
  const results = runModel(inputs);

  const html = renderToStaticMarkup(<ResultsPanel results={results} inputs={inputs} />);

  expect(html).toMatch(/Negative Carry/);
  expect(html).toMatch(/badge-negative/);
  expect(html).toMatch(/more expensive to own than rent/);
  expect(html).toMatch(/hero-negative/);
  expect(html).toMatch(/spread metric/);
  expect(html).toMatch(/Estimated net sale proceeds/);
});
