defmodule BackendWeb.HealthControllerTest do
  use BackendWeb.ConnCase, async: true

  describe "GET /api/health" do
    test "returns health status", %{conn: conn} do
      conn = get(conn, "/api/health")
      assert %{"success" => true, "data" => data} = json_response(conn, 200)
      assert data["status"] == "ok"
      assert data["app"] == "ok"
      assert data["database"] == "ok"
    end
  end

  describe "GET /api/status" do
    test "returns entity counts", %{conn: conn} do
      conn = get(conn, "/api/status")
      assert %{"success" => true, "data" => data} = json_response(conn, 200)
      assert data["tasks"] >= 0
      assert data["agents"] >= 0
      assert data["convoys"] >= 0
    end
  end
end
