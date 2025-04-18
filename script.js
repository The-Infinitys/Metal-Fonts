async function loadSVG(svgPath) {
  try {
    const response = await fetch(svgPath);
    if (!response.ok) {
      console.error(
        `SVGファイルの読み込みに失敗: ${response.status} - ${svgPath}`
      );
      return null;
    }
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    return svgDoc.documentElement; // <svg> 要素を返す
  } catch (error) {
    console.error("SVGファイルの読み込みエラー:", error);
    return null;
  }
}
const font_root = "/";
async function replaceTextWithSVG(metalFontsElement) {
  const fill = metalFontsElement.dataset.fill || metalFontsElement.style.color;
  const textContent = metalFontsElement.textContent;
  metalFontsElement.textContent = "";

  for (const char of textContent) {
    let svgPath = null;
    let className = "svg-letter"; // 基本クラス
    if (char >= "A" && char <= "Z") {
      svgPath = `${font_root}/svg/upper/${char}.svg`;
      className += ` svg-letter-${char}`; // 文字ごとのクラスを追加
    } else if (char === "'") {
      svgPath = `${font_root}/svg/other/single-qt.svg`;
      className += ` svg-letter-single-qt`;
    } else if (char === '"') {
      svgPath = `${font_root}/svg/other/double-qt.svg`;
      className += ` svg-letter-double-qt`;
    }

    if (svgPath) {
      alert("try to get", svtPath);
      const svgElement = await loadSVG(svgPath);

      if (svgElement) {
        // SVG要素にスタイルを適用 (例: fill, stroke)
        if (fill) {
          svgElement
            .querySelectorAll(
              "path, polygon, rect, circle, ellipse, line, polyline"
            )
            .forEach((element) => {
              if (
                element.getAttribute("fill") === null ||
                element.getAttribute("fill") === "none"
              ) {
                element.setAttribute("fill", fill);
              }
            });
        }

        svgElement.classList.add(className); // クラスを追加
        metalFontsElement.appendChild(svgElement);
      } else {
        const errorSpan = document.createElement("span");
        errorSpan.textContent = char;
        metalFontsElement.appendChild(errorSpan);
      }
    } else {
      const otherCharSpan = document.createElement("span");
      otherCharSpan.textContent = char;
      metalFontsElement.appendChild(otherCharSpan);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const metalFontsElements = document.querySelectorAll("metal-fonts");
  metalFontsElements.forEach((element) => {
    replaceTextWithSVG(element);
  });
});
