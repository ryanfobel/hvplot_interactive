importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");

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
  const env_spec = ['https://cdn.holoviz.org/panel/wheels/bokeh-3.3.4-py3-none-any.whl', 'https://cdn.holoviz.org/panel/1.3.8/dist/wheels/panel-1.3.8-py3-none-any.whl', 'pyodide-http==0.2.1']
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
  
import asyncio

from panel.io.pyodide import init_doc, write_doc

init_doc()

#!/usr/bin/env python
# coding: utf-8

# In[1]:


import panel as pn

font_size = 44
margin = 25
header_height = 100
hide_header = False

CSS = f"""
    :host {{
        line-height: 1.4;
        font-size: {font_size}px;
        margin: {margin}px;
    }}

    a.title {{
        font-size: {font_size}px;
        pointer-events: none;
    }}

    .bk-btn-group > .bk-btn {{
        font-size: {font_size}px;
        background: none!important;
        border: none!important;
        padding: 0!important;
        cursor: pointer;
    }}
"""


if hide_header:
    CSS += """
    #header {
        height: 0;
        padding: 0;
        visibility: hidden;
    }
    
    .pn-busy-container {
        visibility: hidden;
    }
    
    div.mdc-top-app-bar--fixed-adjust {
        padding-top: 0;
    }
    """
else:
    CSS += f"""
    header#header {{
        height: {header_height}px;
    }}

    div.mdc-top-app-bar__row {{
        min-height: {header_height}px;
    }}

    main.main-content {{
        position: relative;
        top: 25px;
    }}
    
    div.mdc-drawer__content {{
        margin: {margin}px;
        position: relative;
        top: 12px;
    }}

    button.mdc-icon-button {{
        font-size: {header_height / 2}px;
        height: {header_height}px;
        width: {header_height * 1.5}px;
    }}
    """


pn.extension(raw_css=[CSS])


# In[2]:


markdown_text = """

# Markdown Sample

This sample text is from [The Markdown Guide](https://www.markdownguide.org)!

## Basic Syntax

These are the elements outlined in John Gruber’s original design document. All Markdown applications support these elements.

### Heading

# H1
## H2
### H3

### Bold

**bold text**

### Italic

*italicized text*

### Blockquote

> blockquote

### Ordered List

1. First item
2. Second item
3. Third item

### Unordered List

- First item
- Second item
- Third item

### Code

codecode

### Horizontal Rule

---

### Link

[Markdown Guide](https://www.markdownguide.org)

### Image

![alt text](https://www.markdownguide.org/assets/images/tux.png)

## Extended Syntax

These elements extend the basic syntax by adding additional features. Not all Markdown applications support these elements.

### Table

| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |

### Fenced Code Block

\`
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
\`

### Footnote

Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.

### Definition List

term
: Some definition of the term goes here

### Strikethrough

~~The world is flat.~~

### Task List

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

### Emoji

That is so funny! 😂

(See also [Copying and Pasting Emoji](https://www.markdownguide.org/extended-syntax/#copying-and-pasting-emoji))

"""


# In[23]:


recipe = """
# Bread

## Ingredients

* 500g white bread flour
* 10g salt
* 1.25g instant yeast
* 375g water, cool (15.5C)

![bread](https://raw.githubusercontent.com/ryanfobel/hvplot_interactive/main/docs/images/bread.jpg)

## Instructions
1. Pre-heat dutch oven to 500F.
2. Bake for 30 min.
3. Remove the lid and bake for another 20 minutes.
"""


# In[19]:


row = pn.Row(
    pn.pane.Markdown(
        markdown_text,
    ),
    width=800,
)


# In[14]:


content = {
    "Home": pn.pane.Markdown(
        markdown_text
    ),
    "White bread recipe": pn.pane.Markdown(
        recipe
    ),
}

buttons = [pn.widgets.Button(name=k, button_type="light", button_style="solid") for k in content.keys()]


# In[22]:


close_sizebar_script = f"""<script>
    var drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
    drawer.open = false;
</script>
"""

html_scripts = pn.pane.HTML(close_sizebar_script)

def close_sidebar():
    html_scripts.object = ""
    html_scripts.object = close_sizebar_script

if hide_header:
    sidebar = []
else:
    sidebar=[
        *buttons,
    ]

template = pn.template.MaterialTemplate(
    title='Dashboard',
    sidebar=sidebar,
    main=[
        row,
        html_scripts
    ],
    sidebar_width=600,
    # accent_base_color="#88d8b0",
    # header_background="#88d8b0",
)

def handle_page_change(event):
    template.main[0][0] = content[event.obj.name]
    close_sidebar()

for b in buttons:
    b.on_click(handle_page_change)

template.servable();


# Create a web app with the following command:
# 
# \`\`\`panel convert index.ipynb --to pyodide-worker --out docs --pwa --title Dashboard\`\`\`


await write_doc()
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
    state.curdoc.apply_json_patch(patch.to_py(), setter='js')
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