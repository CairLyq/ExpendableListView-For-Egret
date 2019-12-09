# ExpendableListView-For-Egret

How to use

<code>
  
class SampleView extends eui.Componment {

    private _scroller: eui.Scroller;
    private _listView: ExpendableListView;

    public constructor() {
        super();
        this.skinName = 'XXXXXSkin';
    }

    childrenCreated() {
        super.childrenCreated();

        const listView = this._listView;

        listView.dataProvider = new eui.ArrayCollection([
            { childData: ["1", "2", "3", "4", "5", "6", "7"] },
            { childData: ["1", "2", "3", "4", "5", "6", "7"] },
            { childData: ["1", "2", "3", "4", "5", "6", "7"] },
            { childData: ["1", "2", "3", "4", "5", "6", "7"] }
        ]);

        listView.itemRenderer = ExItemRenderer;
        listView.itemRendererSkinName = 'EqLegendInfoItemSkin';

        listView.childProp = {
            skinName: "XXXXXXItemSkin",
            itemRenderer: XXChildItemRenderer,
            childDataKey: "childData",
            gap: 6,
            itemHeight: 33
        };

        listView.childItemSelectCallback = (data) => {

        }
    }
}

class ExItemRenderer extends ExpendableItemRenderer {

    private content: eui.Group;

    addExpendableChildView(child: ExpendableChildView): boolean {

        if (this.content) {
            this.content.addChild(child);
        }

        return true;
    }
}

class XXChildItemRenderer extends eui.ItemRenderer {
//....
}

</code>
