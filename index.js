document.getElementById("convert-btn").addEventListener("click", function () {
  try {
    const jsonData = JSON.parse(document.getElementById("json-input").value);

    function transformKey(key) {
      if (key === "Reference") return "ref";
      if (key === "System") return "sys";
      if (key === "Component") return ""; // Component는 변수명에서 제외
      return key;
    }

    function flattenJson(obj, prefix = "") {
      let result = {};
      for (let key in obj) {
        let newPrefix = transformKey(key);

        // Component는 prefix를 추가하지 않음
        let finalPrefix =
          key === "Component"
            ? prefix
            : (prefix ? prefix + "-" : "") + newPrefix;

        if (typeof obj[key] === "object" && !("value" in obj[key])) {
          Object.assign(result, flattenJson(obj[key], finalPrefix));
        } else if ("value" in obj[key]) {
          result[finalPrefix] = obj[key].value;
        }
      }
      return result;
    }

    function resolveReferences(cssVars) {
      let resolvedVars = {};
      for (let key in cssVars) {
        let value = cssVars[key];
        let match = value.match(/\{(.*?)\}/);
        if (match) {
          let refKey = match[1].split(".").map(transformKey).join("-");
          if (cssVars[refKey]) {
            resolvedVars[key] = `var(--${refKey})`;
          }
        } else {
          resolvedVars[key] = value;
        }
      }
      return resolvedVars;
    }

    function generateCSS(vars) {
      return (
        `:root {\n` +
        Object.entries(vars)
          .map(([key, value]) => `  --${key}: ${value};`)
          .join("\n") +
        `\n}`
      );
    }

    const flatVars = flattenJson(jsonData);
    const resolvedVars = resolveReferences(flatVars);
    const css = generateCSS(resolvedVars);

    document.getElementById("output").innerText = css;

    // 복사 버튼 보이기
    document.getElementById("copy-btn").style.display = "inline-block";
  } catch (error) {
    document.getElementById("output").innerText =
      "❌ JSON 파싱 오류: 올바른 JSON 형식인지 확인하세요.";
    document.getElementById("copy-btn").style.display = "none";
  }
});

// CSS 복사 기능
document.getElementById("copy-btn").addEventListener("click", function () {
  const cssText = document.getElementById("output").innerText;
  navigator.clipboard
    .writeText(cssText)
    .then(() => {
      alert("✅ 변환된 CSS가 복사되었습니다!");
    })
    .catch((err) => {
      alert("❌ 복사에 실패했습니다.");
      console.error(err);
    });
});
