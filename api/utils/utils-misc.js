'use strict';

/* globals gT: true */
/* globals gIn: true */

/**
 * Safely runs generator.
 * All exceptions are catched and logged.
 *
 * @param gen
 */
function *safeGen(gen) {
  try {
    yield* gen();
  } catch (e) {
    if (gIn.params.errToConsole) {
      gIn.tracer.traceErr('Safe Generator caught error: ' + gIn.textUtils.excToStr(e));
    }
    gT.l.println('Safe Generator caught error: ' + gIn.textUtils.excToStr(e));
  }
}

/**
 * Runs function - generator.
 * Note: the function uses flow and Promise from selenium webdriver.
 *
 * @param gen - function - generator.
 * @returns {Promise}
 */
gT.u.execGen = function (gen) {
  //return flow.execute(gen); // Unsafe variant.
  return gT.sOrig.flow.execute(function () { // Safe variant.
    return gT.sOrig.promise.consume(safeGen, null, gen)
      .catch(function (err) {
        gIn.tracer.traceErr('execGen, consume: ' + err);
      });
  })
    .catch(function (err) {
      gIn.tracer.traceErr('execGen, (flow.execute): ' + err);
    });
};

gT.s.fail = function (url, logAction) {
  return gIn.wrap('Intentional fail for debug: ... ', logAction, function () {
    return promise.rejected('Intentional fail');
  });
};
