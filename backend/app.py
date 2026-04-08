from fastapi import FastAPI, HTTPException
from database import Database
from entity import user, product, order, AddProduct, ProductRating
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()
db = Database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)
 
@app.post("/signup")
async def signup(request : user):
    user_id =  db.add_user(request.phone, request.password)
    if not user_id:
         return {"message" : "phone already exist"}
    return { "user_id" : user_id}   

@app.post("/login")
async def login(request : user):
        User = db.get_user(request.phone)
        if User == False:
             return {"message" : "invalid phone no"}
        if User["password"] != request.password:
             return {"message" : "invalid password"}
        return User

@app.post("/user/update")
async def add_user_profile(request : user):
     db.add_user_profile(request.user_id, request.name, request.dob, request.street, request.area, request.city, request.pincode)
     return {"message" : "updated successfully"}

@app.post("/product/search")
async def search_product(request : product):
     Product = db.search(request.key) 
     if Product == False:
          return {"message" : "No product found"}
     return Product

@app.post("/product")
async def get_product(request : product):
     Product = db.get_product(request.pro_id)
     spec = db.get_product_specification(request.pro_id)
     return {"product" : Product, "spec" : spec}

@app.post("/cart/add-product")
async def add_cart(request : product):
     db.add_cart(request.user_id, request.pro_id, request.spec_id, request.quantity, request.price)
     return {"message" : "added successfully"}

@app.post("/cart")
async def get_cart(request : user):
     return db.get_cart(request.user_id)

@app.post("/cart/clear")
async def clear_cart(request: user):
    db.clear_cart(request.user_id)
    return {"message": "Cart cleared successfully"}

@app.post("/order/place")
async def place_order(request: order):
    data =  db.place_order(request.user_id, request.mode)
    if not data:
         return {"message" : "cart is empty"}
    order_no, total_amt = data
    return {"order_no": order_no, "total_amt": total_amt}

@app.get("/order/view")
async def view_orders(user_id: int):

     orders = db.view_orders(user_id)

     if not orders:
          return {"message": "No orders found", "orders": []}

     return {
          "message": "Orders fetched successfully",
          "orders": orders
     }

@app.get("/home")
async def home():
    try:
        top_category_products = db.get_top_category_products()
        trending_products = db.get_trending_products()

        return {
            "message": "Home Data fetched successfully",
            "category_products": top_category_products, 
            "trending_products": trending_products
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/product/add")
async def add_product(request: AddProduct):
    product_id = db.add_product(
        request.pro_name,
        request.pro_description,
        request.fit,
        request.category,
        request.material,
        request.sex,
        request.price,
        0,  
        0,  
        request.image_link
    )

    if not product_id:
        raise HTTPException(status_code=400, detail="Failed to add product")

    for spec in request.specs:
        db.add_specification(product_id, spec.quantity, spec.size)

    return {"message": "Product added successfully", "product_id": product_id}

@app.post("/product/rating")
async def add_rating(request: ProductRating):
    success = db.add_rating(request.pro_id, request.rating)
    
    if not success:
        raise HTTPException(status_code=400, detail="Product not found or failed to update rating")
    
    return {"message": "Rating added successfully"}

if __name__ == "__main__":
     test_product = product(
                              user_id = 1,
                              pro_id=1,
                              name="T-Shirt",
                              key="shirt",
                              spec_id = 1,
                              quantity = 3,
                              price = 499
                         )
     test_user = user(
                              user_id=1,
                              phone="9876543210",
                              password="password123",
                              name="John Doe",
                              dob="1995-05-20",
                              street="123 Main Street",
                              area="Downtown",
                              city="Mumbai",
                              pincode="400001",
                              mode = "card"
                         )  
     # print(place_order(test_user))
     db = Database()

     pro_id = db.add_product_with_specifications(
     pro_name="Oversized Hoodie",
     pro_description="Premium cotton hoodie, super comfy.",
     fit="Oversized",
     category="Hoodie",
     material="Cotton",
     sex="U",
     price=1999.99,
     rating=0,
     total_rating=0,
     image_link="https://image.com/hoodie.jpg",
     specs=[
          {"size": "S", "quantity": 10},
          {"size": "M", "quantity": 20},
          {"size": "L", "quantity": 15}
     ]
     )

     print("Product added successfully with ID:", pro_id)

