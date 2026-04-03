"""
CPR Financial Calculation Engine
Implements gross/net pool calculations for all client categories.
Auto-runs on every client save/update.
"""


def rev_value(status, rate):
    """Revenue value based on payment status."""
    if status == "paid":
        return rate
    if status in ("chargeback", "refund"):
        return -rate
    return 0.0


def cr_value(status, cr_fee=49.95):
    """CR fee value based on payment status."""
    if status == "paid":
        return cr_fee
    if status in ("chargeback", "refund"):
        return -cr_fee
    return 0.0


def cr_cost_value(status, cost=16.00):
    """CR cost (what we pay) based on payment status. Only for paid months."""
    return cost if status == "paid" else 0.0


MONTHS_JAN_FEB = ["jan", "feb"]
MONTHS_MAR_JUN = ["mar", "apr", "may", "jun"]
ALL_MONTHS = MONTHS_JAN_FEB + MONTHS_MAR_JUN


def _mail(client, m):
    """Get mailing cost for a month."""
    return float(client.get(f"{m}_mail", 0) or client.get(f"{m}_mail_amount", 0) or 0)


def calculate_legacy_cpr(client: dict) -> dict:
    """Calculate P&L for legacy_cpr clients. CR monitoring only, no Rev charge."""
    cr_revenue = sum(cr_value(client.get(f"{m}_cr_status", "n_a")) for m in ALL_MONTHS)
    cr_cost = sum(cr_cost_value(client.get(f"{m}_cr_status", "n_a")) for m in ALL_MONTHS)
    cr_profit = round(cr_revenue - cr_cost, 2)
    total_mailing = sum(_mail(client, m) for m in ALL_MONTHS)

    notary_charged = float(client.get("notary_charged_to_client", 0) or 0)
    has_notary = bool(
        client.get("notary_date")
        or client.get("notary_completed_date")
        or client.get("notary_completed")
    )
    notary_cost = 19.99 if has_notary else 0.0
    notary_profit_loss = round(notary_charged - notary_cost, 2) if has_notary else 0.0
    notary_shortfall = round(max(0, 39.95 - notary_charged), 2) if has_notary else 0.0

    net_pl = round(cr_profit + notary_profit_loss - total_mailing, 2)

    return {
        "cr_revenue": round(cr_revenue, 2),
        "cr_cost": round(cr_cost, 2),
        "cr_profit": cr_profit,
        "notary_profit_loss": notary_profit_loss,
        "notary_shortfall": notary_shortfall,
        "total_mailing": round(total_mailing, 2),
        "net_pl": net_pl,
    }


def calculate_shar_active(client: dict) -> dict:
    """Calculate financials for a shar_active client."""
    if "rev_rate" in client:
        rev_rate = float(client["rev_rate"])
    else:
        monthly_rate = float(client.get("monthly_rate", 149.00))
        rev_rate = monthly_rate - 49.95

    jan_feb_rev = sum(rev_value(client.get(f"{m}_rev_status", "n_a"), rev_rate) for m in MONTHS_JAN_FEB)
    jan_feb_cr = sum(cr_value(client.get(f"{m}_cr_status", "n_a")) for m in MONTHS_JAN_FEB)
    jan_feb_mail = sum(_mail(client, m) for m in MONTHS_JAN_FEB)
    jan_feb_gross = jan_feb_rev + jan_feb_cr - jan_feb_mail

    cr_cost_jf = sum(cr_cost_value(client.get(f"{m}_cr_status", "n_a")) for m in MONTHS_JAN_FEB)
    notary_cost = 19.99 if client.get("notary_date") or client.get("notary_completed_date") else 0.0
    jan_feb_net = jan_feb_gross - (0.10 * jan_feb_gross) - cr_cost_jf - notary_cost

    mar_jun_rev = sum(rev_value(client.get(f"{m}_rev_status", "n_a"), rev_rate) for m in MONTHS_MAR_JUN)
    mar_jun_cr = sum(cr_value(client.get(f"{m}_cr_status", "n_a")) for m in MONTHS_MAR_JUN)
    mar_jun_mail = sum(_mail(client, m) for m in MONTHS_MAR_JUN)
    mar_jun_gross = mar_jun_rev + mar_jun_cr - mar_jun_mail

    cr_cost_mj = sum(cr_cost_value(client.get(f"{m}_cr_status", "n_a")) for m in MONTHS_MAR_JUN)
    mar_jun_net = mar_jun_gross - (0.10 * mar_jun_gross) - cr_cost_mj

    # Notary shortfall for display (not deducted from shar_total for shar_active)
    notary_charged = float(client.get("notary_charged_to_client", 0) or 0)
    has_notary = bool(client.get("notary_date") or client.get("notary_completed_date"))
    notary_profit_loss = round(notary_charged - 19.99, 2) if has_notary else 0.0
    notary_shortfall = round(max(0, 39.95 - notary_charged), 2) if has_notary else 0.0

    shar_total = round(jan_feb_net + (mar_jun_net * 0.5), 2)
    joe_total = round(mar_jun_net * 0.5, 2)
    grand_total = round(shar_total + joe_total, 2)

    # Also compute aggregates for P&L display
    total_mailing = round(jan_feb_mail + mar_jun_mail, 2)
    cr_revenue = round(jan_feb_cr + mar_jun_cr, 2)
    cr_cost_total = round(cr_cost_jf + cr_cost_mj, 2)
    rev_revenue = round(jan_feb_rev + mar_jun_rev, 2)

    return {
        "jan_feb_gross": round(jan_feb_gross, 2),
        "jan_feb_net": round(jan_feb_net, 2),
        "mar_jun_gross": round(mar_jun_gross, 2),
        "mar_jun_net": round(mar_jun_net, 2),
        "shar_total": shar_total,
        "joe_total": joe_total,
        "grand_total": grand_total,
        "notary_profit_loss": notary_profit_loss,
        "notary_shortfall": notary_shortfall,
        "total_mailing": total_mailing,
        "cr_revenue": cr_revenue,
        "cr_cost": cr_cost_total,
        "rev_revenue": rev_revenue,
    }


def calculate_elisabeth(client: dict) -> dict:
    """Calculate financials for a cpr_elisabeth client."""
    rev_rate = float(client.get("monthly_rev_rate", 0))
    cr_fee = float(client.get("cr_fee", 49.95))
    cr_cost = float(client.get("cr_cost", 16.00))

    jan_feb_rev = sum(rev_value(client.get(f"{m}_rev_status", "n_a"), rev_rate) for m in MONTHS_JAN_FEB)
    jan_feb_cr = sum(cr_value(client.get(f"{m}_cr_status", "n_a"), cr_fee) for m in MONTHS_JAN_FEB)
    jan_feb_mail = sum(float(client.get(f"{m}_mail", 0) or 0) for m in MONTHS_JAN_FEB)
    jan_feb_gross = jan_feb_rev + jan_feb_cr - jan_feb_mail

    cr_cost_jf = sum(cr_cost_value(client.get(f"{m}_cr_status", "n_a"), cr_cost) for m in MONTHS_JAN_FEB)
    notary_cost = float(client.get("notary_cost", 19.99)) if client.get("notary_date") else 0.0
    jan_feb_net = jan_feb_gross - (0.10 * jan_feb_gross) - cr_cost_jf - notary_cost

    mar_jun_rev = sum(rev_value(client.get(f"{m}_rev_status", "n_a"), rev_rate) for m in MONTHS_MAR_JUN)
    mar_jun_cr = sum(cr_value(client.get(f"{m}_cr_status", "n_a"), cr_fee) for m in MONTHS_MAR_JUN)
    mar_jun_mail = sum(float(client.get(f"{m}_mail", 0) or 0) for m in MONTHS_MAR_JUN)
    mar_jun_gross = mar_jun_rev + mar_jun_cr - mar_jun_mail

    cr_cost_mj = sum(cr_cost_value(client.get(f"{m}_cr_status", "n_a"), cr_cost) for m in MONTHS_MAR_JUN)
    mar_jun_net = mar_jun_gross - (0.10 * mar_jun_gross) - cr_cost_mj

    notary_charged = float(client.get("notary_charged", 0) or 0)
    notary_standard = float(client.get("notary_standard", 39.95))
    shar_notary_shortfall = max(0.0, notary_standard - notary_charged) if client.get("notary_date") else 0.0
    notary_profit_loss = round(notary_charged - float(client.get("notary_cost", 19.99)), 2) if client.get("notary_date") else 0.0

    shar_total = round(jan_feb_net + (mar_jun_net * 0.5) - shar_notary_shortfall, 2)
    joe_total = round(mar_jun_net * 0.5, 2)
    grand_total = round(shar_total + joe_total, 2)

    return {
        "jan_feb_gross": round(jan_feb_gross, 2),
        "jan_feb_net": round(jan_feb_net, 2),
        "mar_jun_gross": round(mar_jun_gross, 2),
        "mar_jun_net": round(mar_jun_net, 2),
        "shar_total": shar_total,
        "joe_total": joe_total,
        "grand_total": grand_total,
        "shar_notary_shortfall": round(shar_notary_shortfall, 2),
        "notary_profit_loss": round(notary_profit_loss, 2),
    }


def calculate_new_credlocity(client: dict) -> dict:
    """Calculate financials for new_credlocity clients. 50/50 from day one."""
    if "rev_rate" in client:
        rev_rate = float(client["rev_rate"])
    else:
        monthly_rate = float(client.get("monthly_rate", 130))
        rev_rate = monthly_rate - 49.95

    total_rev = sum(rev_value(client.get(f"{m}_rev_status", "n_a"), rev_rate) for m in ALL_MONTHS)
    total_cr = sum(cr_value(client.get(f"{m}_cr_status", "n_a")) for m in ALL_MONTHS)
    total_mail = sum(_mail(client, m) for m in ALL_MONTHS)
    total_gross = total_rev + total_cr - total_mail

    total_cr_cost = sum(cr_cost_value(client.get(f"{m}_cr_status", "n_a")) for m in ALL_MONTHS)

    # Notary
    notary_charged = float(client.get("notary_charged_to_client", 0) or 0)
    has_notary = bool(client.get("notary_date") or client.get("notary_completed_date"))
    notary_cost_val = 19.99 if has_notary else 0.0
    notary_profit_loss = round(notary_charged - notary_cost_val, 2) if has_notary else 0.0
    notary_shortfall = round(max(0, 39.95 - notary_charged), 2) if has_notary else 0.0

    total_net = total_gross - (0.10 * total_gross) - total_cr_cost - notary_cost_val

    shar_total = round(total_net * 0.5, 2)
    joe_total = round(total_net * 0.5, 2)
    grand_total = round(shar_total + joe_total, 2)

    jf_gross = round(sum(
        rev_value(client.get(f"{m}_rev_status", "n_a"), rev_rate) +
        cr_value(client.get(f"{m}_cr_status", "n_a")) -
        _mail(client, m)
        for m in MONTHS_JAN_FEB
    ), 2)
    mj_gross = round(sum(
        rev_value(client.get(f"{m}_rev_status", "n_a"), rev_rate) +
        cr_value(client.get(f"{m}_cr_status", "n_a")) -
        _mail(client, m)
        for m in MONTHS_MAR_JUN
    ), 2)

    return {
        "jan_feb_gross": jf_gross,
        "jan_feb_net": 0,
        "mar_jun_gross": mj_gross,
        "mar_jun_net": 0,
        "total_gross": round(total_gross, 2),
        "total_net": round(total_net, 2),
        "shar_total": shar_total,
        "joe_total": joe_total,
        "grand_total": grand_total,
        "notary_profit_loss": notary_profit_loss,
        "notary_shortfall": notary_shortfall,
        "total_mailing": round(total_mail, 2),
        "cr_revenue": round(total_cr, 2),
        "cr_cost": round(total_cr_cost, 2),
        "rev_revenue": round(total_rev, 2),
    }


def recalculate_client(client: dict) -> dict:
    """Dispatch to the correct calculator based on category."""
    cat = client.get("category", "")
    if cat == "shar_active":
        return calculate_shar_active(client)
    if cat == "cpr_elisabeth":
        return calculate_elisabeth(client)
    if cat == "new_credlocity":
        return calculate_new_credlocity(client)
    if cat == "legacy_cpr":
        return calculate_legacy_cpr(client)
    return {}


def calculate_portfolio(clients: list) -> dict:
    """Calculate portfolio-level P&L totals grouped by category."""
    categories = {}
    for c in clients:
        cat = c.get("category", "unknown")
        if cat not in categories:
            categories[cat] = {
                "count": 0,
                "cr_revenue": 0.0, "cr_cost": 0.0,
                "rev_revenue": 0.0,
                "notary_revenue": 0.0, "notary_cost": 0.0,
                "mailing_cost": 0.0,
                "notary_waivers": 0, "notary_discounts": 0,
                "total_shortfall": 0.0,
                "shar_total": 0.0, "joe_total": 0.0,
                "canceled_count": 0,
            }
        d = categories[cat]
        d["count"] += 1
        if c.get("canceled") or c.get("status") == "canceled":
            d["canceled_count"] += 1

        for m in ALL_MONTHS:
            cr_s = c.get(f"{m}_cr_status", "n_a")
            d["cr_revenue"] += cr_value(cr_s)
            d["cr_cost"] += cr_cost_value(cr_s)
            d["mailing_cost"] += _mail(c, m)
            # Rev revenue (SA and NC)
            if cat in ("shar_active", "new_credlocity"):
                rr = float(c.get("rev_rate", 0) or 0)
                d["rev_revenue"] += rev_value(c.get(f"{m}_rev_status", "n_a"), rr)

        notary_charged = float(c.get("notary_charged_to_client", 0) or 0)
        has_n = bool(c.get("notary_date") or c.get("notary_completed_date") or c.get("notary_completed"))
        if has_n:
            d["notary_revenue"] += notary_charged
            d["notary_cost"] += 19.99
            shortfall = max(0, 39.95 - notary_charged)
            d["total_shortfall"] += shortfall
            if notary_charged == 0:
                d["notary_waivers"] += 1
            elif notary_charged < 39.95:
                d["notary_discounts"] += 1

        d["shar_total"] += float(c.get("shar_total", 0) or 0)
        d["joe_total"] += float(c.get("joe_total", 0) or 0)

    for cat in categories:
        d = categories[cat]
        for k in d:
            if isinstance(d[k], float):
                d[k] = round(d[k], 2)

    return categories
