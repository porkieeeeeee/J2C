document.addEventListener("DOMContentLoaded", function () {
  const jsonInput = document.getElementById("json-input");
  const deleteBtn = document.querySelector(".delete-btn");
  const output = document.getElementById("output");
  const copyBtn = document.getElementById("copy-btn");

  function transformKey(key) {
    if (key === "Reference") return "ref";
    if (key === "System") return "sys";
    if (key === "Component") return "";
    return key;
  }

  function flattenJson(obj, prefix = "") {
    let result = {};
    for (let key in obj) {
      let newPrefix = transformKey(key);
      let finalPrefix =
        key === "Component" ? prefix : (prefix ? prefix + "-" : "") + newPrefix;

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

  function convertJSON() {
    try {
      const jsonData = JSON.parse(jsonInput.value.trim());

      const flatVars = flattenJson(jsonData);
      const resolvedVars = resolveReferences(flatVars);
      const css = generateCSS(resolvedVars);

      output.innerText = css;
      copyBtn.style.display = "inline-block";
    } catch (error) {
      output.innerText = "❌ JSON 파싱 오류: 올바른 JSON 형식인지 확인하세요.";
      copyBtn.style.display = "none";
    }
    updateUI();
  }

  function updateUI() {
    if (jsonInput.value.trim()) {
      deleteBtn.style.display = "inline-block";
    } else {
      deleteBtn.style.display = "none";
    }
  }

  jsonInput.addEventListener("input", convertJSON);

  deleteBtn.addEventListener("click", function () {
    jsonInput.value = "";
    convertJSON();
    updateUI();
  });

  copyBtn.addEventListener("click", function () {
    navigator.clipboard
      .writeText(output.innerText)
      .then(() => alert("✅ 변환된 CSS가 복사되었습니다!"))
      .catch(() => alert("❌ 복사에 실패했습니다."));
  });

  updateUI();
});
