/*
* @Author: 永青
* @Date:   2019-12-09 19:42:00
* @Last Modified by:   永青
* @Last Modified time: 2019-12-09 20:13:23
*/
/**
 * 可展开的 Render，需要实现 
 * @addExpendableChildView  
 * 加载 子项列表
 */
abstract class ExpendableItemRenderer extends eui.ItemRenderer {
    abstract addExpendableChildView(child: ExpendableChildView): boolean;
}

type ExpendItemConstructor = new () => ExpendableItemRenderer;

/** 此事件在子列表触发 itemTapEvent 时派发 data={gPos,cPos} */
const ChildSelectedEvent = 'ChildSelectEvent';


/**
 * 二级列表
 */
class ExpendableListView extends eui.List {


    private groupMetadataList: Array<GroupMetadata>;

    private _childProp: { skinName: string, itemRenderer, childDataKey: string };

    private _childItemRenderers: { [key: number]: ExpendableChildView } = {
        [0]: null,
        [1]: null
    };

    /**
     * 是否派发子项选中数据
     */
    private _triggerChildEvent = false;

    /** 子列表选中事件监听 */
    public childItemSelectCallback: (data: GroupMetadata) => void;

    constructor() {
        super();
        this.groupMetadataList = [];
    }

    set dataProvider(value: eui.ArrayCollection) {
        egret.superSetter(ExpendableListView, this, 'dataProvider', value);

        this.groupMetadataList = new Array(value.length);

        for (let i = 0; i < value.length; i++) {
            this._setMetadata(i, false);
        }
    }

    get dataProvider(): eui.ArrayCollection {
        return egret.superGetter(ExpendableListView, this, 'dataProvider');
    }

    get childProp(): { skinName: string, itemRenderer, childDataKey: string, itemHeight?, gap?} {
        return this._childProp;
    }

    /**
     * @param skinName 子项皮肤
     * @param rendererFunction 子项渲染器
     * @param childDataKey 子项数据索引
     * @param itemHeight 子项高度
     * @param gap   子项列表间隔
     */
    set childProp(v: { skinName: string, itemRenderer, childDataKey: string, itemHeight?, gap?}) {
        let self = this;
        self._childProp = v;
        for (let i in self._childItemRenderers) {
            if (self._childItemRenderers[i] == null) {
                let view = new ExpendableChildView();
                view.addEventListener(ChildSelectedEvent, this._triggerChildItemSelected, this);
                view.setItemRender(v.itemRenderer, v.skinName);
                self._childItemRenderers[i] = view;
                continue;
            }
            self._releaseChildItem(self._childItemRenderers[i]);
            self._childItemRenderers[i].setItemRender(v.itemRenderer, v.skinName);
        }
    }

    /** 项渲染器必须继承至  @ExpendableItemRenderer */
    get itemRenderer(): ExpendItemConstructor {
        return egret.superGetter(ExpendableListView, this, 'itemRenderer')
    }

    /** 项渲染器必须继承至  @ExpendableItemRenderer */
    set itemRenderer(value: ExpendItemConstructor) {
        egret.superSetter(ExpendableListView, this, 'itemRenderer', value);
    }

    /** @returns  该项是否被展开 */
    isGroupExpanded(pos: number): boolean {
        const data = this.groupMetadataList;
        if (pos >= 0 && data.length > pos) {
            if (pos == data[pos].gPos && data[pos].expend) {
                return true;
            }
        }
        return false;
    }

    /**  收缩子列表 */
    collapseGroup(pos: number) {
        if (pos < 0 || pos >= this.groupMetadataList.length) return;
        let childView = this._getChildItem(pos);
        childView && childView.collapse();
        this._setMetadata(pos, false, -1);
    }

    /** 展开子列表，会先收起其他已经打开的子列表 */
    expandGroup(pos: number) {
        if (pos < 0 || pos >= this.groupMetadataList.length) return;
        this._collapseOther(pos);

        let childView = this._getChildItem(pos);
        if (childView) {
            const childData = this.dataProvider.getItemAt(pos)[this.childProp.childDataKey];
            childView.setData(childData, pos, this.childProp);
            childView.expand();
            this._setMetadata(pos, true);
        } else {
            const { child, key } = this._getIdleChildItem(pos);
            const element = this.getElementAt(pos) as ExpendableItemRenderer;
            const childData = this.dataProvider.getItemAt(pos)[this.childProp.childDataKey];
            child.setData(childData, pos, this.childProp);
            element.addExpendableChildView(child);
            child.expand();
            this._setMetadata(pos, true, key);
        }
    }

    protected childrenCreated() {
        super.childrenCreated();
        this.addEventListener(eui.ItemTapEvent.ITEM_TAP, this._itemTap, this);
    }

    private _triggerChildItemSelected(evt: egret.Event) {
        this._triggerChildEvent = true;
        console.log('_triggerChildEvent', evt.data);
        if (this.childItemSelectCallback != null) {
            this.childItemSelectCallback(evt.data);
        }
    }

    private _itemTap(evt: eui.ItemTapEvent) {
        if (this._triggerChildEvent) {
            return this._triggerChildEvent = false;
        }

        let value = this.selectedIndex;

        const isExpanded = this.isGroupExpanded(value);

        if (isExpanded == false)
            this.expandGroup(value);
        else
            this.collapseGroup(value);
    }


    private _collapseOther(pos: number) {
        let self = this;
        for (let i in self._childItemRenderers) {
            let item = self._childItemRenderers[i];
            if (item == null || item.isIdle || item.gPos == pos)
                continue;
            self._setMetadata(item.gPos, false, -1)
            self._childItemRenderers[i].collapse();
        }
    }

    private _setMetadata(pos: number, isExpand = false, keyOfView?) {
        const data = this.groupMetadataList;

        if (pos < 0 || pos > data.length - 1) return;

        if (data[pos] == undefined)
            data[pos] = new GroupMetadata(pos, isExpand);
        else {
            data[pos].gPos = pos;
            isExpand != undefined && (data[pos].expend = isExpand);
            keyOfView != undefined && (data[pos].keyOfView = keyOfView);
        }
        this.groupMetadataList = data;
    }

    private _getChildItem(pos: number) {
        if (pos < 0 || pos >= this.groupMetadataList.length) return null;
        const data = this.groupMetadataList[pos];
        return this._childItemRenderers[data.keyOfView];
    }


    private _getIdleChildItem(pos: number) {
        let child: ExpendableChildView;
        let key;
        let self = this;

        for (let i in self._childItemRenderers) {
            if (self._childItemRenderers[i] != null && self._childItemRenderers[i].isIdle) {
                child = self._childItemRenderers[i];
                key = i;
                break;
            }
        }

        // 没有找到 闲置的 item,      --Never Happen
        if (!child) {
            child = new ExpendableChildView();
            child.addEventListener(ChildSelectedEvent, this._triggerChildItemSelected, this);
            child.setItemRender(self.childProp.itemRenderer, self.childProp.skinName);
            self._childItemRenderers[pos] = child;
            key = pos;
        }

        return { child, key };
    }

    private _releaseChildItem(child: ExpendableChildView) {
        child.release();
    }

    $onRemoveFromStage() {
        super.$onRemoveFromStage();

        let self = this;
        self.childItemSelectCallback = null;
        self.removeEventListener(eui.ItemTapEvent.ITEM_TAP, self._itemTap, self);

        for (let i in self._childItemRenderers) {
            if (self._childItemRenderers[i] == null)
                continue;

            self._childItemRenderers[i].removeEventListener(ChildSelectedEvent, self._triggerChildItemSelected, self);
            self._childItemRenderers[i].release();
            delete self._childItemRenderers[i];
        }
    }
}
