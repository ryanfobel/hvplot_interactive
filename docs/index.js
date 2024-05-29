importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: 'patch',
    patch: patch,
    buffers: buffers
  })
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({type: 'status', msg: 'Loading pyodide'})
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = ['https://cdn.holoviz.org/panel/wheels/bokeh-3.4.1-py3-none-any.whl', 'https://cdn.holoviz.org/panel/1.4.3/dist/wheels/panel-1.4.3-py3-none-any.whl', 'pyodide-http==0.2.1', 'hvplot', 'pandas']
  for (const pkg of env_spec) {
    let pkg_name;
    if (pkg.endsWith('.whl')) {
      pkg_name = pkg.split('/').slice(-1)[0].split('-')[0]
    } else {
      pkg_name = pkg
    }
    self.postMessage({type: 'status', msg: `Installing ${pkg_name}`})
    try {
      await self.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}');
      `);
    } catch(e) {
      console.log(e)
      self.postMessage({
	type: 'status',
	msg: `Error while installing ${pkg_name}`
      });
    }
  }
  console.log("Packages loaded!");
  self.postMessage({type: 'status', msg: 'Executing code'})
  const code = `
  \nimport asyncio\n\nfrom panel.io.pyodide import init_doc, write_doc\n\ninit_doc()\n\nfrom panel import state as _pn__state\nfrom panel.io.handlers import CELL_DISPLAY as _CELL__DISPLAY, display, get_figure as _get__figure\n\n_pn__state._cell_outputs['bb937979-28a0-4a53-a186-8814f1669168'].append("""%conda create -n pn pandas panel selenium pyarrow python-dotenv jupyterlab arrow matplotlib scikit-learn datashader""")\nimport panel as pn\nimport pandas as pd\n\nimport hvplot.pandas\nhvplot.extension('bokeh')\n\n# def get_series(**options):\n#     df = pd.read_csv(options["url"], index_col=0)\n#     df.index = pd.to_datetime(df.index, utc=True).tz_convert(options["tz"])\n#     df = df.sort_index(ascending=True)\n#     return df[[options["column"]]].rename(columns={options["column"]: options["name"]})\n\n\n# options_gridwatch = dict(\n#     name = "gridwatch",\n#     url="https://raw.githubusercontent.com/ryanfobel/ontario-grid-data/main/data/clean/gridwatch.ca/hourly/summary.csv",\n#     tz="America/Toronto",\n#     column = "CO2e Intensity (g/kWh)"\n# )\n\n# options_co2signal = dict(\n#     name="co2signal",\n#     url="https://raw.githubusercontent.com/ryanfobel/ontario-grid-data/main/data/clean/co2signal.com/CA-ON/hourly/output.csv",\n#     column = "data.carbonIntensity",\n#     tz="America/Toronto",\n# )\n\n# df = get_series(**options_gridwatch).join(\n#     get_series(**options_co2signal),\n#     how="inner"\n# )\n\n# df.iloc[-24:].to_pickle("df.pickle")\n# with open("df.pickle", "rb") as f:\n#     p = f.read()\n\nimport pickle\n\np = b"\\x80\\x05\\x95\\x9a\\x06\\x00\\x00\\x00\\x00\\x00\\x00\\x8c\\x11pandas.core.frame\\x94\\x8c\\tDataFrame\\x94\\x93\\x94)\\x81\\x94}\\x94(\\x8c\\x04_mgr\\x94\\x8c\\x1epandas.core.internals.managers\\x94\\x8c\\x0cBlockManager\\x94\\x93\\x94\\x8c\\x16pandas._libs.internals\\x94\\x8c\\x0f_unpickle_block\\x94\\x93\\x94\\x8c\\x12numpy.core.numeric\\x94\\x8c\\x0b_frombuffer\\x94\\x93\\x94(\\x96\\xc0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00C@\\x00\\x00\\x00\\x00\\x00\\x005@\\x00\\x00\\x00\\x00\\x00\\x00\\x1c@\\x00\\x00\\x00\\x00\\x00\\x00\\x18@\\x00\\x00\\x00\\x00\\x00\\x00\\x18@\\x00\\x00\\x00\\x00\\x00\\x00\\x1c@\\x00\\x00\\x00\\x00\\x00\\x00:@\\x00\\x00\\x00\\x00\\x00\\x00C@\\x00\\x00\\x00\\x00\\x00\\x00F@\\x00\\x00\\x00\\x00\\x00\\x80D@\\x00\\x00\\x00\\x00\\x00\\x00I@\\x00\\x00\\x00\\x00\\x00\\x80J@\\x00\\x00\\x00\\x00\\x00\\x00I@\\x00\\x00\\x00\\x00\\x00\\x80I@\\x00\\x00\\x00\\x00\\x00\\x00G@\\x00\\x00\\x00\\x00\\x00\\x80I@\\x00\\x00\\x00\\x00\\x00\\x00M@\\x00\\x00\\x00\\x00\\x00\\x80N@\\x00\\x00\\x00\\x00\\x00\\x00L@\\x00\\x00\\x00\\x00\\x00\\x00O@\\x00\\x00\\x00\\x00\\x00\\x80O@\\x00\\x00\\x00\\x00\\x00\\x00F@\\x00\\x00\\x00\\x00\\x00\\x00?@\\x00\\x00\\x00\\x00\\x00\\x004@\\x94\\x8c\\x05numpy\\x94\\x8c\\x05dtype\\x94\\x93\\x94\\x8c\\x02f8\\x94\\x89\\x88\\x87\\x94R\\x94(K\\x03\\x8c\\x01<\\x94NNNJ\\xff\\xff\\xff\\xffJ\\xff\\xff\\xff\\xffK\\x00t\\x94bK\\x01K\\x18\\x86\\x94\\x8c\\x01C\\x94t\\x94R\\x94\\x8c\\x08builtins\\x94\\x8c\\x05slice\\x94\\x93\\x94K\\x00K\\x01K\\x01\\x87\\x94R\\x94K\\x02\\x87\\x94R\\x94h\\x0bh\\x0e(\\x96\\xc0\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x1a\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x0b\\x00\\x00\\x00\\x00\\x00\\x00\\x00)\\x00\\x00\\x00\\x00\\x00\\x00\\x00+\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x18\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x1f\\x00\\x00\\x00\\x00\\x00\\x00\\x00#\\x00\\x00\\x00\\x00\\x00\\x00\\x00/\\x00\\x00\\x00\\x00\\x00\\x00\\x000\\x00\\x00\\x00\\x00\\x00\\x00\\x006\\x00\\x00\\x00\\x00\\x00\\x00\\x00:\\x00\\x00\\x00\\x00\\x00\\x00\\x009\\x00\\x00\\x00\\x00\\x00\\x00\\x00D\\x00\\x00\\x00\\x00\\x00\\x00\\x00E\\x00\\x00\\x00\\x00\\x00\\x00\\x00?\\x00\\x00\\x00\\x00\\x00\\x00\\x00D\\x00\\x00\\x00\\x00\\x00\\x00\\x00G\\x00\\x00\\x00\\x00\\x00\\x00\\x00I\\x00\\x00\\x00\\x00\\x00\\x00\\x00=\\x00\\x00\\x00\\x00\\x00\\x00\\x00J\\x00\\x00\\x00\\x00\\x00\\x00\\x002\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x1d\\x00\\x00\\x00\\x00\\x00\\x00\\x00:\\x00\\x00\\x00\\x00\\x00\\x00\\x00A\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x94h\\x12\\x8c\\x02i8\\x94\\x89\\x88\\x87\\x94R\\x94(K\\x03h\\x16NNNJ\\xff\\xff\\xff\\xffJ\\xff\\xff\\xff\\xffK\\x00t\\x94bK\\x01K\\x18\\x86\\x94h\\x19t\\x94R\\x94h\\x1eK\\x01K\\x02K\\x01\\x87\\x94R\\x94K\\x02\\x87\\x94R\\x94\\x86\\x94]\\x94(\\x8c\\x18pandas.core.indexes.base\\x94\\x8c\\n_new_Index\\x94\\x93\\x94h1\\x8c\\x05Index\\x94\\x93\\x94}\\x94(\\x8c\\x04data\\x94\\x8c\\x15numpy.core.multiarray\\x94\\x8c\\x0c_reconstruct\\x94\\x93\\x94h\\x10\\x8c\\x07ndarray\\x94\\x93\\x94K\\x00\\x85\\x94C\\x01b\\x94\\x87\\x94R\\x94(K\\x01K\\x02\\x85\\x94h\\x12\\x8c\\x02O8\\x94\\x89\\x88\\x87\\x94R\\x94(K\\x03\\x8c\\x01|\\x94NNNJ\\xff\\xff\\xff\\xffJ\\xff\\xff\\xff\\xffK?t\\x94b\\x89]\\x94(\\x8c\\tgridwatch\\x94\\x8c\\tco2signal\\x94et\\x94b\\x8c\\x04name\\x94Nu\\x86\\x94R\\x94\\x8c\\x1dpandas.core.indexes.datetimes\\x94\\x8c\\x12_new_DatetimeIndex\\x94\\x93\\x94hN\\x8c\\rDatetimeIndex\\x94\\x93\\x94}\\x94(h7\\x8c\\x13pandas._libs.arrays\\x94\\x8c\\x1c__pyx_unpickle_NDArrayBacked\\x94\\x93\\x94\\x8c\\x1cpandas.core.arrays.datetimes\\x94\\x8c\\rDatetimeArray\\x94\\x93\\x94J\\x1f\\x06\\xf1\\x04N\\x87\\x94R\\x94\\x8c\\x19pandas.core.dtypes.dtypes\\x94\\x8c\\x0fDatetimeTZDtype\\x94\\x93\\x94)\\x81\\x94}\\x94(\\x8c\\x04unit\\x94\\x8c\\x02ns\\x94\\x8c\\x02tz\\x94\\x8c\\x04pytz\\x94\\x8c\\x02_p\\x94\\x93\\x94(\\x8c\\x0fAmerica/Toronto\\x94Jx\\xb5\\xff\\xffK\\x00\\x8c\\x03LMT\\x94t\\x94R\\x94ubh:h<K\\x00\\x85\\x94h>\\x87\\x94R\\x94(K\\x01K\\x18\\x85\\x94h\\x12\\x8c\\x02M8\\x94\\x89\\x88\\x87\\x94R\\x94(K\\x04h\\x16NNNJ\\xff\\xff\\xff\\xffJ\\xff\\xff\\xff\\xffK\\x00}\\x94(C\\x02ns\\x94K\\x01K\\x01K\\x01t\\x94\\x86\\x94t\\x94b\\x89C\\xc0\\x00\\xe0:\\x95\\xcd\\x87\\xd3\\x17\\x00\\x80\\xf3\\xc5\\x13\\x8b\\xd3\\x17\\x00\\xc0d'\\xa0\\x91\\xd3\\x17\\x00\`\\x1dX\\xe6\\x94\\xd3\\x17\\x00\\x00\\xd6\\x88,\\x98\\xd3\\x17\\x00\\xa0\\x8e\\xb9r\\x9b\\xd3\\x17\\x00\\xe0\\xff\\x1a\\xff\\xa1\\xd3\\x17\\x00\\x80\\xb8KE\\xa5\\xd3\\x17\\x00 q|\\x8b\\xa8\\xd3\\x17\\x00\\xc0)\\xad\\xd1\\xab\\xd3\\x17\\x00\`\\xe2\\xdd\\x17\\xaf\\xd3\\x17\\x00\\x00\\x9b\\x0e^\\xb2\\xd3\\x17\\x00\\xa0S?\\xa4\\xb5\\xd3\\x17\\x00@\\x0cp\\xea\\xb8\\xd3\\x17\\x00\\xe0\\xc4\\xa00\\xbc\\xd3\\x17\\x00\\x80}\\xd1v\\xbf\\xd3\\x17\\x00 6\\x02\\xbd\\xc2\\xd3\\x17\\x00\`\\xa7cI\\xc9\\xd3\\x17\\x00\\x00\`\\x94\\x8f\\xcc\\xd3\\x17\\x00@\\xd1\\xf5\\x1b\\xd3\\xd3\\x17\\x00\\xe0\\x89&b\\xd6\\xd3\\x17\\x00\\x80BW\\xa8\\xd9\\xd3\\x17\\x00 \\xfb\\x87\\xee\\xdc\\xd3\\x17\\x00\\xc0\\xb3\\xb84\\xe0\\xd3\\x17\\x94t\\x94b}\\x94\\x8c\\x05_freq\\x94Ns\\x87\\x94bhKNu\\x86\\x94R\\x94e\\x86\\x94R\\x94\\x8c\\x04_typ\\x94\\x8c\\tdataframe\\x94\\x8c\\t_metadata\\x94]\\x94\\x8c\\x05attrs\\x94}\\x94\\x8c\\x06_flags\\x94}\\x94\\x8c\\x17allows_duplicate_labels\\x94\\x88sub."\ndf = pickle.loads(p, encoding="bytes")\n_pn__state._cell_outputs['9571b17e-7226-4ecb-9d1f-aeea01776f5b'].append((df))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['9571b17e-7226-4ecb-9d1f-aeea01776f5b'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['9571b17e-7226-4ecb-9d1f-aeea01776f5b'].append(_fig__out)\n\nplot_options = dict(\n    value_label='g/kWh',\n    legend='bottom',\n    title="co2e intensity",\n)\nfig = df.hvplot.line(**plot_options)\n_pn__state._cell_outputs['a289a70f-1043-4d2f-be3d-eb65d2fb3a5d'].append((fig))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['a289a70f-1043-4d2f-be3d-eb65d2fb3a5d'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['a289a70f-1043-4d2f-be3d-eb65d2fb3a5d'].append(_fig__out)\n\ntemplate = pn.template.EditableTemplate(\n    title='Ontario grid monitor',\n    main=pn.Row(\n        fig\n    )\n)\ntemplate.servable();\n\n_pn__state._cell_outputs['d7749a31-8939-43a1-a3ba-7ad9beac04d6'].append("""http://localhost:8000/docs""")\n\n\nawait write_doc()
  `

  try {
    const [docs_json, render_items, root_ids] = await self.pyodide.runPythonAsync(code)
    self.postMessage({
      type: 'render',
      docs_json: docs_json,
      render_items: render_items,
      root_ids: root_ids
    })
  } catch(e) {
    const traceback = `${e}`
    const tblines = traceback.split('\n')
    self.postMessage({
      type: 'status',
      msg: tblines[tblines.length-2]
    });
    throw e
  }
}

self.onmessage = async (event) => {
  const msg = event.data
  if (msg.type === 'rendered') {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `)
  } else if (msg.type === 'patch') {
    self.pyodide.globals.set('patch', msg.patch)
    self.pyodide.runPythonAsync(`
    from panel.io.pyodide import _convert_json_patch
    state.curdoc.apply_json_patch(_convert_json_patch(patch), setter='js')
    `)
    self.postMessage({type: 'idle'})
  } else if (msg.type === 'location') {
    self.pyodide.globals.set('location', msg.location)
    self.pyodide.runPythonAsync(`
    import json
    from panel.io.state import state
    from panel.util import edit_readonly
    if state.location:
        loc_data = json.loads(location)
        with edit_readonly(state.location):
            state.location.param.update({
                k: v for k, v in loc_data.items() if k in state.location.param
            })
    `)
  }
}

startApplication()