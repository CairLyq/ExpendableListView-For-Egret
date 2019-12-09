/*
* @Author: 永青
* @Date:   2019-12-09 19:41:55
* @Last Modified by:   永青
* @Last Modified time: 2019-12-09 19:41:55
*/
class GroupMetadata {
    // 父列表主键
    gPos: number;
    // 子列表主键
    cPos: number;
    expend: boolean;
    /** 对应的视图索引，-1 为空 */
    keyOfView: number;

    constructor(gPos, expend = false, keyOfView = -1) {
        this.gPos = gPos;
        this.expend = expend;
        this.keyOfView = keyOfView;
    }
}