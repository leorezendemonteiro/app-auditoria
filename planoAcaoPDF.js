export function gerarRelatorioPlanoAcao({itens, estName, responsavelNome, responsavelCargo, auditorNome, auditorCrn, logo}) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;
    if (logo) {
        const imgW = 40; // largura aproximada de 120px
        const imgX = (pageWidth - imgW) / 2;
        doc.addImage(logo, 'PNG', imgX, y - 5, imgW, 15);
        y += 20;
    }
    doc.setFillColor(235, 240, 255);
    doc.rect(15, y - 5, pageWidth - 30, 25, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(18);
    doc.text('Plano de Ação', pageWidth / 2, y + 5, { align: 'center' });
    doc.setFontSize(11).setFont('helvetica', 'normal');
    const auditDate = new Date().toLocaleDateString('pt-BR');
    doc.text(`Cliente: ${estName}`, 20, y + 12);
    doc.text(`Data da Auditoria: ${auditDate}`, 20, y + 18);
    doc.text(`Auditor: ${auditorNome}`, pageWidth/2 + 10, y + 12);
    doc.text(`CRN: ${auditorCrn}`, pageWidth/2 + 10, y + 18);
    doc.text(`Responsável: ${responsavelNome} – ${responsavelCargo}`, 20, y + 24);
    y += 32;
    itens.forEach((item, idx) => {
        if (y > 250) { doc.addPage(); y = 15; }
        const qText = doc.splitTextToSize(item.question, pageWidth - 40);
        const justText = doc.splitTextToSize('Justificativa: ' + item.justification, pageWidth - 40);
        let boxHeight = 8 + qText.length*5 + justText.length*5;
        if (idx % 2 === 1) {
            doc.setFillColor(245,245,245);
            doc.rect(15, y - 2, pageWidth - 30, boxHeight, 'F');
        }
        doc.setDrawColor(200);
        doc.roundedRect(15, y - 2, pageWidth - 30, boxHeight, 2, 2);
        let textY = y + 4;
        doc.setFont('helvetica','bold');
        doc.text(qText, 20, textY);
        textY += qText.length*5;
        doc.setFont('helvetica','normal');
        doc.text(justText, 20, textY);
        textY += justText.length*5;
        doc.text(`Início: ${item.inicio}`, 20, textY);
        doc.text(`Término: ${item.termino}`, pageWidth/2 + 10, textY);
        y += boxHeight + 4;
    });
    let signY = doc.internal.pageSize.getHeight() - 40;
    const addSignature = (canvas, label, x) => {
        if (canvas && canvas.dataset.signature) {
            doc.addImage(canvas.dataset.signature, 'PNG', x, signY, 60, 30);
        }
        doc.setLineWidth(0.2).line(x, signY + 32, x + 60, signY + 32);
        doc.setFontSize(10).text(label, x + 5, signY + 37);
    };
    addSignature(document.getElementById('signature-pad-responsible'), 'Assinatura do Responsável', 25);
    addSignature(document.getElementById('signature-pad-auditor'), 'Assinatura do Auditor', 120);
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(12).text(`Responsável: ${responsavelNome} – ${responsavelCargo}`, 105, footerY - 2, { align: 'center' });
    doc.text(`Auditor: ${auditorNome} – CRN: ${auditorCrn}`, 105, footerY + 8, { align: 'center' });
    const sanitizedName = (estName || 'empresa').replace(/[^a-z0-9]/gi,'_').toLowerCase();
    const fileDate = new Date().toISOString().slice(0,10);
    const fileName = `PlanoAcao-${fileDate}-${sanitizedName}.pdf`;
    const dataUri = doc.output('datauristring');
    return dataUri;
}
