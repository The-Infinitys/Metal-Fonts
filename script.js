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
const font_root = "/Metal-Fonts";
async function replaceTextWithSVG(metalFontsElement) {
  const fill = metalFontsElement.dataset.fill || metalFontsElement.style.color;
  const textContent = metalFontsElement.textContent;
  metalFontsElement.textContent = "";

  for (const originalChar of textContent) {
    const char = originalChar.toUpperCase(); // 全て大文字に変換

    let svgPath = null;
    let classNameBase = "svg-letter"; // 基本クラス
    let specificClassName = "";
    console.log(char);
    if (char >= "A" && char <= "Z") {
      svgPath = `${font_root}/svg/upper/${char}.svg`;
      specificClassName = `svg-letter-${char}`; // 文字ごとのクラス
    } else if (char === "'") {
      svgPath = `${font_root}/svg/other/single-qt.svg`;
      specificClassName = `svg-letter-single-qt`;
    } else if (char === '"') {
      svgPath = `${font_root}/svg/other/double-qt.svg`;
      specificClassName = `svg-letter-double-qt`;
    } else if (char === " ") {
      svgPath = `${font_root}/svg/other/space.svg`;
      specificClassName = `svg-letter-space`;
    }

    if (svgPath) {
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

        svgElement.classList.add(classNameBase); // 基本クラスを追加
        if (specificClassName) {
          svgElement.classList.add(specificClassName); // 文字ごとのクラスを追加
        }
        metalFontsElement.appendChild(svgElement);
      } else {
        // SVG読み込み失敗時も元の文字を表示する
        const errorSpan = document.createElement("span");
        errorSpan.textContent = originalChar; // 元の文字を表示
        metalFontsElement.appendChild(errorSpan);
      }
    } else {
      // SVGパスが見つからない場合も元の文字を表示する
      const otherCharSpan = document.createElement("span");
      otherCharSpan.textContent = originalChar; // 元の文字を表示
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
