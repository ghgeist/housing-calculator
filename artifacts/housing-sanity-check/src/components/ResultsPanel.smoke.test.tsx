import React from "react";
import { test } from "vitest";
import assert from "node:assert/strict";
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

  assert.match(html, /Positive Carry/);
  assert.match(html, /badge-positive/);
  assert.match(html, /cheaper to own than rent/);
  assert.match(html, /hero-positive/);
});

test("renders negative carry badge and more-expensive-to-own copy", () => {
  const inputs = {
    ...DEFAULT_INPUTS,
    monthlyRent: 1_000,
  };
  const results = runModel(inputs);

  const html = renderToStaticMarkup(<ResultsPanel results={results} inputs={inputs} />);

  assert.match(html, /Negative Carry/);
  assert.match(html, /badge-negative/);
  assert.match(html, /more expensive to own than rent/);
  assert.match(html, /hero-negative/);
});
