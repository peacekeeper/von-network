function fetch_validator_status(callb) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', function(evt) {
        callb(oReq.response, evt);
    });
    oReq.addEventListener('error', function(evt) {
        callb(null, evt);
    });
    oReq.responseType = 'json';
    oReq.open('GET', './status');
    oReq.send();
}

fetch_validator_status(function(status) {
    var panel = document.querySelector('.panel-node-status');
    var load = panel && panel.querySelector('.loading');
    var err = panel && panel.querySelector('.error');
    if(load) load.style.display = 'none';

    if(! Array.isArray(status)) {
        if(err) err.style.display = null;
        return;
    }

    if(! panel) return;
    var tpl = panel.querySelector('.node-status.template');
    if(! tpl) return;

    for(var idx = 0; idx < status.length; idx ++) {
        var node = status[idx];
        var div = tpl.cloneNode(true);
        tpl.parentNode.appendChild(div);
        div.querySelector('.nodeval-name').innerText = node.alias;
        div.querySelector('.nodeval-did').innerText = node.did;
        var state = node.state;
        if(! state) state = 'unknown';
        if(! node.enabled) state += ' (disabled)'
        div.querySelector('.nodeval-state').innerText = state;
        div.querySelector('.nodeval-indyver').innerText = node.software['indy-node'];

        var upt = node.metrics.uptime,
            upt_s = upt % 60,
            upt_m = Math.floor(upt % 3600 / 60),
            upt_h = Math.floor(upt % 86400 / 3600),
            upt_d = Math.floor(upt / 86400),
            upt_parts = [];
        if(upt_d)
            upt_parts.push('' + upt_d + ' days');
        if(upt_h || upt_parts.length)
            upt_parts.push('' + upt_h + ' hours');
        if(upt_m || upt_parts.length)
            upt_parts.push('' + upt_m + ' minutes');
        upt_parts.push('' + upt_s + ' seconds');        
        div.querySelector('.nodeval-uptime').innerText = upt_parts.join(', ');

        var unreach = div.querySelector('.node-unreach');
        if(node.pool.unreachable.count) {
            div.querySelector('.nodeval-unreach').innerText = node.pool.unreachable.list.join(', ');
        } else {
            unreach.style.display = 'none';
        }

        var txns = [],
            tx_avgs = node.metrics['average-per-second'],
            tx_counts = node.metrics['transaction-count'];
        txns.push('' + tx_counts.config + ' config')
        txns.push('' + tx_counts.ledger + ' ledger')
        txns.push('' + tx_counts.pool + ' pool')
        txns.push('' + tx_avgs['read-transactions'] + '/s read')
        txns.push('' + tx_avgs['write-transactions'] + '/s write')
        div.querySelector('.nodeval-txns').innerText = txns.join(', ');

        //metrics: {average-per-second: {read-transactions: 0, write-transactions: 0}, transaction-count: {ledger: 5, pool: 4, config: 0}, uptime: 781}
        //pool: {reachable: {count: 4, list: ["Node1", "Node2", "Node3", "Node4"]}, total-count: 4, unreachable: {count: 0, list: []}}
        div.classList.remove('template');
    }
});

