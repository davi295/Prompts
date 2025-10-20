const STORAGE_KEY = "prompt-storage"

const state = {
  prompts: [],
  selectedId: null,
}

const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  sidebarOverlay: document.getElementById("sidebar-overlay"),
  bntSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnnew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
}

function updateEditableWrapperState(element, wrapper) {
  if (!element || !wrapper) return
  const hasText = element.textContent.trim().length > 0
  wrapper.classList.toggle("is-empty", !hasText)
}

function isMobile() {
  return window.innerWidth <= 950
}

function openSidebar() {
  if (!elements.sidebar || !elements.btnOpen) return

  if (isMobile()) {
    elements.sidebar.classList.add("open")
    if (elements.sidebarOverlay) elements.sidebarOverlay.classList.add("open")
  } else {
    elements.sidebar.classList.remove("hidden")
    elements.btnOpen.classList.add("hidden")
  }
}

function closeSidebar() {
  if (!elements.sidebar || !elements.btnOpen) return

  if (isMobile()) {
    elements.sidebar.classList.remove("open")
    if (elements.sidebarOverlay)
      elements.sidebarOverlay.classList.remove("open")
  } else {
    elements.sidebar.classList.add("hidden")
    elements.btnOpen.classList.remove("hidden")
  }
}

function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

function attachAllEditableHandlers() {
  if (elements.promptTitle)
    elements.promptTitle.addEventListener("input", function () {
      updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
    })

  if (elements.promptContent)
    elements.promptContent.addEventListener("input", function () {
      updateEditableWrapperState(
        elements.promptContent,
        elements.contentWrapper
      )
    })
}

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  if (!title || !hasContent) {
    alert("Título e conteúdo são obrigatórios.")
    return
  }

  if (state.selectedId) {
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId)

    if (existingPrompt) {
      existingPrompt.title = title || "Sem título"
      existingPrompt.content = content || " Sem conteúdo"
    }
  } else {
    const newPrompt = {
      id: Date.now().toString(),
      title,
      content,
    }
    state.prompts.unshift(newPrompt)
    state.selectedId = newPrompt.id
  }
  renderList(elements.search.value)
  persist()
  alert("Prompt salvo com sucesso!")
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.log("Erro ao salvar no localStorage:", error)
  }
}

function load() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    state.prompts = stored ? JSON.parse(stored) : []
    state.selectedId = null
  } catch (error) {
    console.log("Erro ao carregar do localStorage:", error)
  }
}

function creatPromptItem(prompt) {
  return `
       <li class="prompt-item" data-id="${prompt.id}" data-action="select">
         <div class="prompt-item-meta">
           <div class="prompt-item-title">
             ${prompt.title}
           </div>
           <div class="prompt-item-description">
             ${prompt.content}
           </div>
         </div>

         <button class="btn btn-icon btn-delete" aria-label="Remover prompt" data-action="remove">
           <img
             src="assets/remove.svg"
             alt="Remover"
             class="icon icon-trash"
           />
         </button>
       </li>
  `
}

function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => creatPromptItem(p))
    .join("")

  elements.list.innerHTML = filteredPrompts
}
function newPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.innerHTML = ""
  updateAllEditableStates()

  elements.promptTitle.focus()
}

function copyPrompt() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.textContent.trim()

  if (!title && !content) {
    alert("Não há conteúdo para copiar.")
    return
  }

  const textToCopy = title ? `${title}\n\n${content}` : content

  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      alert("Prompt copiado!")
    })
    .catch((err) => {
      console.error("Erro ao copiar: ", err)
      alert("Erro ao copiar o prompt.")
    })
}

elements.bntSave.addEventListener("click", save)
elements.btnnew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copyPrompt)

elements.search.addEventListener("input", function (event) {
  renderList(event.target.value)
})

elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest("[data-action='remove']")
  const item = event.target.closest("[data-id]")

  if (!item) return

  const id = item.getAttribute("data-id")
  state.selectedId = id

  if (removeBtn) {
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value)
    persist()
    alert("Prompt removido com sucesso!")
    return
  }

  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    }
  }
})

function init() {
  load()
  renderList("")
  attachAllEditableHandlers()
  updateAllEditableStates()

 
  if (isMobile()) {
   
    if (elements.sidebar) elements.sidebar.classList.remove("open")
    if (elements.btnOpen) elements.btnOpen.classList.remove("hidden")
  } else {
    
    if (elements.sidebar) elements.sidebar.classList.remove("hidden")
    if (elements.btnOpen) elements.btnOpen.classList.add("hidden")
  }

  if (elements.btnOpen) elements.btnOpen.addEventListener("click", openSidebar)
  if (elements.btnCollapse)
    elements.btnCollapse.addEventListener("click", closeSidebar)
  if (elements.sidebarOverlay)
    elements.sidebarOverlay.addEventListener("click", closeSidebar)

  
  window.addEventListener("resize", function () {
    if (isMobile()) {
     
      if (elements.sidebar) elements.sidebar.classList.remove("open")
      if (elements.sidebarOverlay)
        elements.sidebarOverlay.classList.remove("open")
      if (elements.btnOpen) elements.btnOpen.classList.remove("hidden")
    } else {
      
      if (elements.sidebar) {
        elements.sidebar.classList.remove("hidden")
        elements.sidebar.classList.remove("open")
      }
      if (elements.sidebarOverlay)
        elements.sidebarOverlay.classList.remove("open")
      if (elements.btnOpen) elements.btnOpen.classList.add("hidden")
    }
  })
}

init()
