import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

import FileCopyIcon from '@mui/icons-material/FileCopy';

import { Utils, I18n } from '@iobroker/adapter-react-v5';

import IODialog from '../Components/IODialog';

// import 'ace-builds/webpack-resolver';

import 'ace-builds/src-min-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/worker-json';
import 'ace-builds/src-min-noconflict/ext-language_tools';
import 'ace-builds/src-min-noconflict/theme-clouds_midnight';
import 'ace-builds/src-min-noconflict/theme-chrome';

const WidgetExportDialog = props => {
    const widgets = props.selectedWidgets.map(wid => {
        const w = JSON.parse(JSON.stringify(props.widgets[wid]));
        w._id = wid;
        return w;
    });

    const groupWidgets = [];

    let gIdx = 1;
    let wIdx = 1;
    const len = widgets.length;
    for (let w = 0; w < len; w++) {
        const widget = widgets[w];
        if (widget.tpl === '_tplGroup') {
            const newId = `f${gIdx.toString().padStart(6, '0')}`;
            gIdx++;

            if (widget.data && widget.data.members) {
                const members = [];
                widget.data.members.forEach(member => {
                    if (groupWidgets.includes(member)) {
                        return;
                    }
                    const memberWidget = JSON.parse(JSON.stringify(props.widgets[member]));
                    memberWidget._id = `i${wIdx.toString().padStart(6, '0')}`;
                    wIdx++;
                    members.push(memberWidget._id);
                    memberWidget.groupid = newId;
                    memberWidget.grouped = true;
                    widgets.push(memberWidget);
                    groupWidgets.push(member);
                });

                widget.data.members = members;
            }
            widget._id = newId;
        } else if (widget._id.startsWith('w')) {
            if (widget.grouped) {
                delete widget.grouped;
                delete widget.groupid;
                delete widget._id;
            } else {
                widget._id = `i${wIdx.toString().padStart(6, '0')}`;
                wIdx++;
            }
        }
    }

    return <IODialog
        open={props.open}
        onClose={props.onClose}
        title="Export widgets"
        closeTitle="Close"
        action={() => {
            Utils.copyToClipboard(JSON.stringify(widgets, null, 2));
            props.onClose();
            window.alert(I18n.t('Copied to clipboard'));
        }}
        actionTitle="Copy to clipboard"
        actionNoClose
        ActionIcon={FileCopyIcon}
    >
        <AceEditor
            mode="json"
            theme={props.themeName === 'dark' ? 'clouds_midnight' : 'chrome'}
            value={JSON.stringify(widgets, null, 2)}
            height="200px"
        />
    </IODialog>;
};

WidgetExportDialog.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    themeName: PropTypes.string,
    widgets: PropTypes.object,
    selectedWidgets: PropTypes.object,
};

export default WidgetExportDialog;
