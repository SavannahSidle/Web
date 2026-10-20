(() => {
  const frame = document.getElementById("site-preview");
  if (!frame) return;

  const markup = `<div class="space-preview-context"><span>MICA / INTERFACE STUDIES</span><span>PREVIEW MOCKUP · UNPUBLISHED</span></div>
<div class="space-preview-stage">
  <header class="space-preview-header"><span>SOLAR SYSTEM</span><span>EXPLORER</span></header>
  <section class="space-preview-focus" aria-label="Selected planet">
    <span class="space-preview-kicker">PLANET / 05</span>
    <h3>Jupiter</h3>
    <p>Gas giant</p>
    <small>Orbital distances not to scale</small>
  </section>
  <div class="space-preview-orbits" aria-hidden="true">
    <i class="space-preview-orbit orbit-mercury"><b class="space-preview-planet planet-mercury"></b></i>
    <i class="space-preview-orbit orbit-venus"><b class="space-preview-planet planet-venus"></b></i>
    <i class="space-preview-orbit orbit-earth"><b class="space-preview-planet planet-earth"></b></i>
    <i class="space-preview-orbit orbit-mars"><b class="space-preview-planet planet-mars"></b></i>
    <i class="space-preview-orbit orbit-jupiter"><b class="space-preview-planet planet-jupiter"></b></i>
    <i class="space-preview-orbit orbit-saturn"><b class="space-preview-planet planet-saturn"></b></i>
    <i class="space-preview-orbit orbit-uranus"><b class="space-preview-planet planet-uranus"></b></i>
    <i class="space-preview-orbit orbit-neptune"><b class="space-preview-planet planet-neptune"></b></i>
    <b class="space-preview-sun"></b>
  </div>
  <ul class="space-preview-rail" aria-label="Planets in the solar system">
    <li><i class="space-preview-planet planet-mercury"></i><span>Mercury</span></li>
    <li><i class="space-preview-planet planet-venus"></i><span>Venus</span></li>
    <li><i class="space-preview-planet planet-earth"></i><span>Earth</span></li>
    <li><i class="space-preview-planet planet-mars"></i><span>Mars</span></li>
    <li class="is-selected" aria-current="true"><i class="space-preview-planet planet-jupiter"></i><span>Jupiter</span></li>
    <li><i class="space-preview-planet planet-saturn"></i><span>Saturn</span></li>
    <li><i class="space-preview-planet planet-uranus"></i><span>Uranus</span></li>
    <li><i class="space-preview-planet planet-neptune"></i><span>Neptune</span></li>
  </ul>
</div>`;

  function installPreview() {
    let page;
    try { page = frame.contentDocument; } catch (_) { return; }
    if (!page) return;

    const card = page.querySelector(".design-studies .study-space");
    const screen = card && card.querySelector(".space-screen");
    if (!screen) return;

    screen.className = "study-screen solar-system-preview";
    screen.removeAttribute("data-selected-planet");
    screen.innerHTML = markup;

    if (!page.getElementById("test-space-preview-styles")) {
      const stylesheet = page.createElement("link");
      stylesheet.id = "test-space-preview-styles";
      stylesheet.rel = "stylesheet";
      stylesheet.href = new URL("preview.css", window.location.href).href;
      page.head.appendChild(stylesheet);
    }
  }

  frame.addEventListener("load", installPreview);
  try {
    if (frame.contentDocument && frame.contentDocument.readyState === "complete") installPreview();
  } catch (_) {}
})();