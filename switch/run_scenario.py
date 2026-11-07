"""Submit a real SocietyOps incident and require a live Switch-connected Discord bridge."""

from switch_client import SocietyOpsClient


def run_societyops_scenario() -> None:
    client = SocietyOpsClient()
    status = client.switch_status()
    if not status.get("connected"):
        state = status.get("state", "unknown")
        raise RuntimeError(
            f"Switch chat is not connected (state: {state}). "
            "Configure the Discord bot and room channels, then restart SocietyOps."
        )
    if "incident-water-leak-001" not in status.get("connectedRoomIds", []):
        raise RuntimeError(
            "The #incident-water-leak-001 room is not connected. "
            "Add its Discord channel ID to DISCORD_ROOM_CHANNELS."
        )

    incident = client.create_incident(
        "Water is leaking from the ceiling in Block B, Flat B-204. "
        "Please investigate related reports; do not dispatch anyone without manager approval."
    )
    print(
        f"Created {incident['ticketNumber']} and posted the triage handoff to "
        "#incident-water-leak-001. Continue the investigation with the Switch agents "
        "and manager in the connected Discord channel."
    )


if __name__ == "__main__":
    run_societyops_scenario()
