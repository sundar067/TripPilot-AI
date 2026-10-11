// Normalize search text

const normalizeSearchName = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
};

export default normalizeSearchName;
