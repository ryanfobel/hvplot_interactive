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
  \nimport asyncio\n\nfrom panel.io.pyodide import init_doc, write_doc\n\ninit_doc()\n\nfrom panel import state as _pn__state\nfrom panel.io.handlers import CELL_DISPLAY as _CELL__DISPLAY, display, get_figure as _get__figure\n\nimport panel as pn\nimport pandas as pd\nimport hvplot\nimport hvplot.pandas\n\n\nfont_size = 44\nmargin = 25\nheader_height = 100\nhide_header = False\n\nCSS = f"""\n    :host {{\n        line-height: 1.4;\n        font-size: {font_size}px;\n        margin: {margin}px;\n    }}\n\n    a.title {{\n        font-size: {font_size}px;\n        pointer-events: none;\n    }}\n\n    .bk-btn-group > .bk-btn {{\n        font-size: {font_size}px;\n        background: none!important;\n        border: none!important;\n        padding: 0!important;\n    }}\n\n    .pn-busy-container {{\n        visibility: hidden;\n    }}\n"""\n\n\nif hide_header:\n    CSS += """\n    #header {\n        height: 0;\n        padding: 0;\n        visibility: hidden;\n    }\n   \n    div.mdc-top-app-bar--fixed-adjust {\n        padding-top: 0;\n    }\n    """\nelse:\n    CSS += f"""\n    header#header {{\n        height: {header_height}px;\n    }}\n\n    div.mdc-top-app-bar__row {{\n        min-height: {header_height}px;\n    }}\n\n    main.main-content {{\n        position: relative;\n        top: 25px;\n    }}\n    \n    div.mdc-drawer__content {{\n        margin: {margin}px;\n        position: relative;\n        top: 12px;\n    }}\n\n    button.mdc-icon-button {{\n        font-size: {header_height / 2}px;\n        height: {header_height}px;\n        width: {header_height * 1.5}px;\n    }}\n    """\n\nhvplot.extension('bokeh')\n_pn__state._cell_outputs['39eb0b65-d99b-4b8b-a030-15a26a27d9ef'].append((pn.extension(raw_css=[CSS])))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['39eb0b65-d99b-4b8b-a030-15a26a27d9ef'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['39eb0b65-d99b-4b8b-a030-15a26a27d9ef'].append(_fig__out)\n\n\nmarkdown_text = """\n\n# Markdown Sample\n\nThis sample text is from [The Markdown Guide](https://www.markdownguide.org)!\n\n## Basic Syntax\n\nThese are the elements outlined in John Gruber\u2019s original design document. All Markdown applications support these elements.\n\n### Heading\n\n# H1\n## H2\n### H3\n\n### Bold\n\n**bold text**\n\n### Italic\n\n*italicized text*\n\n### Blockquote\n\n> blockquote\n\n### Ordered List\n\n1. First item\n2. Second item\n3. Third item\n\n### Unordered List\n\n- First item\n- Second item\n- Third item\n\n### Code\n\ncodecode\n\n### Horizontal Rule\n\n---\n\n### Link\n\n[Markdown Guide](https://www.markdownguide.org)\n\n### Image\n\n![alt text](https://www.markdownguide.org/assets/images/tux.png)\n\n## Extended Syntax\n\nThese elements extend the basic syntax by adding additional features. Not all Markdown applications support these elements.\n\n### Table\n\n| Syntax | Description |\n| ----------- | ----------- |\n| Header | Title |\n| Paragraph | Text |\n\n### Fenced Code Block\n\n\`\n{\n  "firstName": "John",\n  "lastName": "Smith",\n  "age": 25\n}\n\`\n\n### Footnote\n\nHere's a sentence with a footnote. [^1]\n\n[^1]: This is the footnote.\n\n### Definition List\n\nterm\n: Some definition of the term goes here\n\n### Strikethrough\n\n~~The world is flat.~~\n\n### Task List\n\n- [x] Write the press release\n- [ ] Update the website\n- [ ] Contact the media\n\n### Emoji\n\nThat is so funny! \U0001f602\n\n(See also [Copying and Pasting Emoji](https://www.markdownguide.org/extended-syntax/#copying-and-pasting-emoji))\n\n"""\nrecipe = """\n# Bread\n\n## Ingredients\n\n* 500g white bread flour\n* 10g salt\n* 1.25g instant yeast\n* 375g water, cool (15.5C)\n\n![bread](https://raw.githubusercontent.com/ryanfobel/hvplot_interactive/main/docs/images/bread.jpg)\n\n## Instructions\n1. Pre-heat dutch oven to 500F.\n2. Bake for 30 min.\n3. Remove the lid and bake for another 20 minutes.\n"""\n\n\ndef get_series(**options):\n    df = pd.read_csv(options["url"], index_col=0)\n    df.index = pd.to_datetime(df.index, utc=True).tz_convert(options["tz"])\n    df = df.sort_index(ascending=True)\n    return df[[options["column"]]].rename(columns={options["column"]: options["name"]})\n\n\noptions_gridwatch = dict(\n    name = "gridwatch",\n    url="https://raw.githubusercontent.com/ryanfobel/ontario-grid-data/main/data/clean/gridwatch.ca/hourly/summary.csv",\n    tz="America/Toronto",\n    column = "CO2e Intensity (g/kWh)"\n)\n\noptions_co2signal = dict(\n    name="co2signal",\n    url="https://raw.githubusercontent.com/ryanfobel/ontario-grid-data/main/data/clean/co2signal.com/CA-ON/hourly/output.csv",\n    column = "data.carbonIntensity",\n    tz="America/Toronto",\n)\n\ndf = get_series(**options_gridwatch).join(\n    get_series(**options_co2signal),\n    how="inner"\n)\nfigure = df.hvplot.line(\n    value_label='cO2 intensity (g/kWh)',\n    legend='bottom',\n    height=500,\n    width=620\n)\n_pn__state._cell_outputs['01c04dac-3b92-4bc2-951d-6a7dee9bf85e'].append((figure))\nfor _cell__out in _CELL__DISPLAY:\n    _pn__state._cell_outputs['01c04dac-3b92-4bc2-951d-6a7dee9bf85e'].append(_cell__out)\n_CELL__DISPLAY.clear()\n_fig__out = _get__figure()\nif _fig__out:\n    _pn__state._cell_outputs['01c04dac-3b92-4bc2-951d-6a7dee9bf85e'].append(_fig__out)\n\ncontent = {\n    # "Home": pn.pane.Markdown(\n    #     markdown_text\n    # ),\n    # "White bread recipe": pn.pane.Markdown(\n    #     recipe\n    # ),\n    "Home": pn.panel(\n        figure\n    ),\n}\n\nbuttons = [pn.widgets.Button(name=k, button_type="light", button_style="solid") for k in content.keys()]\nclose_sizebar_script = f"""<script>\n    var drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));\n    drawer.open = false;\n</script>\n"""\n\nhtml_scripts = pn.pane.HTML(close_sizebar_script)\n\ndef close_sidebar():\n    html_scripts.object = ""\n    html_scripts.object = close_sizebar_script\n\nif hide_header:\n    sidebar = []\nelse:\n    sidebar=[\n        *buttons,\n    ]\n\ntemplate = pn.template.MaterialTemplate(\n    title='Dashboard',\n    sidebar=sidebar,\n    main=[\n        content["Home"],\n        html_scripts\n    ],\n    sidebar_width=600,\n    # accent_base_color="#88d8b0",\n    # header_background="#88d8b0",\n)\n\ndef handle_page_change(event):\n    print(event)\n    template.main[0][0] = content[event.obj.name]\n    close_sidebar()\n\nfor b in buttons:\n    b.on_click(handle_page_change)\n\ntemplate.servable();\n_pn__state._cell_outputs['8cf982b1-a0ba-4fb4-80d0-dad4b6c71154'].append("""Create a web app with the following command:\n\n\`\`\`panel convert index.ipynb --to pyodide-worker --out docs --pwa --title Dashboard\`\`\`\n\n    Run python3 -m http.server to start a web server locally\n\n    Open http://localhost:8000/pyodide/script.html to try out the app.""")\n\nawait write_doc()
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