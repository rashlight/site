function copyToClipboard(anchorElement) {
  const codeElement = anchorElement?.parentElement?.parentElement?.querySelector("pre code");

  if (!codeElement) {
    console.error("Copy failed: Could not find code block.");
    return;
  }

  let textToCopy = codeElement.textContent || codeElement.innerText;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        var copyImage = anchorElement.querySelector("img");
        copyImage.src = "/img/check.svg";
        setTimeout(() => {
          copyImage.src = "/img/copy.svg";
        }, 1500);
      })
      .catch((err) => {
        console.error("Copy failed: ", err);
      });
  } else {
    alert("Copy failed: Clipboard access is not available in this environment.");
  }
}