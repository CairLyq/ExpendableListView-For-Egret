/*
* @Author: 永青
* @Date:   2019-12-09 19:41:20
* @Last Modified by:   永青
* @Last Modified time: 2019-12-09 20:12:15
*/

/**
 * @warnning 虚拟布局已禁用
 */
class ExpendableChildView extends eui.Component {

    constructor() {
        super();

        const dataProvider = new eui.ArrayCollection();
        const list = new eui.List();
        const layout = new eui.VerticalLayout();
        layout.gap = this._props.gap;
        list.layout = layout;
        list.dataProvider = dataProvider;

        list.useVirtualLayout = false;

        this.addChild(list);

        this._dataProvider = dataProvider;
        this._listView = list;
        this._listView.addEventListener(eui.ItemTapEvent.ITEM_TAP, this._itemTap, this);
    }

    private _listView: eui.List;

    private _dataProvider: eui.ArrayCollection;

    /** 组 position */
    public gPos: number;

    /** 是否闲置中 */
    public isIdle = true;

    /** 收缩列表计数器 */
    private _collapseCounter = -1;

    /** 列表属性配置 */
    private _props = {
        itemHeight: 80,
        gap: 0,
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 0,
        paddingLeft: 0
    };

    private _itemTap(evt: eui.ItemTapEvent) {
        let data = {
            gPos: this.gPos,
            cPos: evt.itemIndex
        };

        this.dispatchEventWith(ChildSelectedEvent, false, data);
    }

    setItemRender(itemRenderer, skinName) {
        this._listView.itemRenderer = itemRenderer;
        this._listView.itemRendererSkinName = skinName;
        return this;
    }

    /**
     * 设置数据
     * @param data 
     * @param gPos 
     */
    setData(data, gPos, props: { itemHeight?, gap?}) {
        this._dataProvider.replaceAll(data);
        this.gPos = gPos;

        this._props.itemHeight = props.itemHeight || 80;
        this._props.gap = props.gap || 0;

        if (undefined != props.gap) {
            this._listView.layout['gap'] = props.gap;
        }

        return this;
    }

    release() {
        this._dataProvider.removeAll();
        this.isIdle = true;
        this.gPos = -1;
        this._collapseCounter = -1;
        this.parent && this.parent.removeChild(this);
        egret.Tween.removeTweens(this);
    }

    collapse() {
        if (this.isIdle) return;

        this._collapseCounter = this._dataProvider.length;

        egret.Tween.get(this, { onChange: this._onCollapseChange, onChangeObj: this })
            .to({ height: 0 }, 200)
            .wait(20)
            .call(() => {
                this.release();
            })
    }

    private _onCollapseChange() {
        this._collapseCounter--;
        if (this._collapseCounter >= 0) {
            let item = this._listView.getChildAt(this._collapseCounter);
            item.visible = false;
        }
    }

    expand() {
        this.isIdle = false;
        this.height = this._dataProvider.length * (this._props.itemHeight + this._props.gap);
    }
}