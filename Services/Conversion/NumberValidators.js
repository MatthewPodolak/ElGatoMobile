export const doubleValidator = (text) => {
    const sanitizedText = text.replace(/[^0-9.,]/g, '');
    const standardizedText = sanitizedText.replace(/,/g, '.');
    const match = standardizedText.match(/^\d+(\.\d+)?$/);

    if (match) {
        return parseFloat(parseFloat(standardizedText).toFixed(2));
    }

    return null;
};

export const intValidator = (text) => {
    const sanitizedText = text.replace(/[^0-9.,]/g, '');
    const standardizedText = sanitizedText.replace(/,/g, '.');
    const number = parseFloat(standardizedText);

    if (!isNaN(number)) {
        return Math.round(number);
    }

    return null;
};