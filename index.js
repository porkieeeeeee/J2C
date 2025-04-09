document.addEventListener("DOMContentLoaded", function () {
  const jsonInput = document.getElementById("json-input");
  const deleteBtn = document.querySelector(".delete-btn");
  const output = document.getElementById("output");
  const copyBtn = document.getElementById("copy-btn");

  function transformKey(key) {
    if (key === "reference") return "ref";
    if (key === "system") return "sys";
    if (key === "component") return "com";
    return key;
  }

  function flattenJson(obj, prefix = "") {
    let result = {};
    for (let key in obj) {
      const current = obj[key];
      const newPrefix = transformKey(key);
      const finalPrefix =
        key === "Component" ? prefix : (prefix ? prefix + "-" : "") + newPrefix;

      if (current && typeof current === "object") {
        if ("value" in current) {
          result[finalPrefix] = current.value;
        } else {
          Object.assign(result, flattenJson(current, finalPrefix));
        }
      }
    }
    return result;
  }

  function resolveReferences(cssVars) {
    const resolvedVars = {};

    function resolveValue(value, currentKey) {
      const match = value.match(/\{(.*?)\}/);
      if (match) {
        const rawPath = match[1];
        const refKey = rawPath.replace(/\./g, "-");

        if (currentKey.includes("com-")) {
          return `var(--sys-${refKey})`;
        } else if (currentKey.includes("sys-")) {
          return `var(--ref-${refKey})`;
        } else if (currentKey.includes("ref-")) {
          return `var(--ref-${refKey})`;
        } else {
          return `var(--${refKey})`;
        }
      }
      return value;
    }

    for (const key in cssVars) {
      resolvedVars[key] = resolveValue(cssVars[key], key);
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
      output.innerText = "❌ JSON 파싱 오류: " + error.message;
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
