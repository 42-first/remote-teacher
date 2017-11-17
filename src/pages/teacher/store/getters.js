const getters = {
  userid: state => state.userid,
  lessonid: state => state.lessonid,
  presentationid: state => state.presentationid,
  current: state => state.current,
  pptData: state => state.pptData,
  newtougao: state => state.newtougao,
  isPPTVersionAboveOne: state => state.isPPTVersionAboveOne,
  socket: state => state.socket,
  qrcodeStatus: state => state.qrcodeStatus,
  idIndexMap: state => state.idIndexMap,
};
export default getters
