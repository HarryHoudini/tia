// jscs:ignore
(function setCmpWrappers() {
  'use strict';

  var funcsWithSelectorAsFirstArg = [
    'byCompQuery',
    'byParentAndCompQuery',
  ];

  console.log('TIA: setEBrCmpWrappers');
  window.tiaEJ.wrapCmp = function wrapCmp(cmp, args, funcName) {

    var getResult = tia.cU.result;

    var cmpInfo = {
      searchParams: {
        args: Array.prototype.slice.call(args),
        funcName: funcName,
      },
      constProps: {
        ariaRole: cmp.ariaRole,
        autoGenId: cmp.autoGenId, // to log
        // autoGenId1: cmp.getAutoId(), // digital suffix.

        className: cmp.self.getName(),
        classNamePriv: cmp.$className,

        domEl: cmp.getEl().dom, // Can be used in selenium webdriver.
        domElId: cmp.getEl().id, // Just in case.

        fakeId: tiaEJ.idMap.getFakeId(cmp.getId()), // to log
        fileInputEl: getResult(cmp, 'fileInputEl.dom'),

        inputId: getResult(cmp, 'getInputId'), // Can be autogenerated.
        inputEl: getResult(cmp, 'inputEl.dom'),
        isComponent: cmp.isComponent,
        isContainer: cmp.isContainer,
        isInputField: cmp.isInputField,
        itemId: cmp.getItemId(), // to log

        name: getResult(cmp, 'getName'), // to log

        realId: cmp.getId(),

        xtype: cmp.getConfig('xtype'), // to log
        // xtypes: cmp.getXTypes(), // Buggy. Should be calculated with self.superclass.getConfig('xtype')
      },
      varProps: {
        text: getResult(cmp, 'getText'),
        tooltip: cmp.tooltip,
        tooltipType: cmp.tooltipType,
        value: getResult(cmp, 'getValue'),
        isMasked: cmp.isMasked(),
        isSuspended: cmp.isSuspended(),
        isFocusable: cmp.isFocusable(),
        isVisible: cmp.isVisible(),
      },
    };

    if (funcsWithSelectorAsFirstArg.includes(cmpInfo.fName)) {
      cmpInfo.searchParams.selector = arguments[0];
    }


    // Actions:
    // * focus()
    // * repaint
    // * scroll
    // * scrollIntoView
    // * show
    // * selectText
    // * selectable
    // * setVisible
    // * self.fromPagePoint
    // * fromPoint
    // * get
    // * getAciveElement

    // Button:
    // menu, tooltip, tooltipType, value, isButton, !!click!!,
    // getEl, getId, getMenu, getText, getValue,
    //

    return {
      cmp: cmp,
      cmpInfo: cmpInfo,
    };

    // TODO: только это надо сделать в серверной части.
    // return {
    //   getLogInfo: function getLogInfo() {
    //     return 'TODO';
    //   },
    //   getFakeId: function getFakeId() {
    //     return 'TODO';
    //   },
    // };
  };
})();
