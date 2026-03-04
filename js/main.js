let eventBus = new Vue();

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <div class="product">
        <div class="product-image">
            <img :src="image" :alt="altText"/>
        </div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>
            <a :href="link"> More products like this.</a>
            <p>{{ sale }}</p>
            <p v-if="inStock">In stock</p>
            <p v-else
                :class="{ 'line-through': !inStock}"    
            >
                Out of Stock
                
            </p>
            

            <div 
                class="color-box"
                v-for="(variant, index) in variants"
                :key="variant.variantId"
                :style="{ backgroundColor:variant.variantColor }"
                @mouseover="updateProduct(index)"
            >
            </div>

            <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add to cart</button>
            <button v-on:click="deleteCart">delete cart</button>

            
            <product-tabs :reviews="reviews" :shipping-cost="shipping" :product-details="details" :product-sizes="sizes"></product-tabs>
        </div>
   </div>
   `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            selectedVariant: 0,
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            inventory: 0,
            onSale: true,
            reviews: [],
            details: ['80% cotton', '20% polyester', 'ecology friendly'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
                ],
                sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        }
    },

    methods: {
            addToCart() {
                this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
            },

            deleteCart() {
                this.$emit('delete-to-cart', this.variants[this.selectedVariant].variantId);
            },
            
            updateProduct(index) {
                this.selectedVariant = index;
                console.log(this.selectedVariant);
            },

    },

    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },

        image() {
                return this.variants[this.selectedVariant].variantImage;
        },

        sale() {
            if (this.onSale) {
                return this.brand + this.product + ' ON SALE! '
            } else {
                return this.brand + this.product + ' standart price '
            }
        },

        inStock(){
            return this.variants[this.selectedVariant].variantQuantity
        },

        shipping() {
            if (this.premium){
                return "Free";
            } else {
                return 2.99
            }
        }
    },

    mounted() {
        eventBus.$on('review-submitted', (productReview) => {
            this.reviews.push(productReview)
        })
    }
})

Vue.component('product-details', {
    template: `
    <ul>
        <li v-for="detail in details">{{ detail }}</li>
    </ul>
    `,

    data() {
        return {
            details: ['80% cotton', '20% polyester', 'Gender-neutral']
        }
    }
})

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </p>

        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name">
        </p>

        <p>
            <label for="review">Review:</label>
            <textarea id="review" v-model="review"></textarea>
        </p>

        <p>
            <label for="recommend">Would you recommend this product?</label>
            <label> <input type="radio" name="recommend" v-model="recommend" value="yes">Yes</label>  
            <label> <input type="radio" name="recommend" v-model="recommend" value="no">No</label>  
        </p>

        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
                </select>
        </p>

        <p>
            <input type="submit" value="Submit"> 
        </p>
    </form>
 `,
   data() {
       return {
           name: null,
           review: null,
           rating: null,
           recommend: null,
           errors: []
       }
    },

    methods:{
        onSubmit() {
            this.errors = []

            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Recommend required")
            }
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },

        shippingCost: {
            type: [String,Number],
            required: true
        },

        productDetails: {
            type: Array,
            required: true
        },

        productSizes: {
            type: Array,
            required: true
        }
    },

    template: `
        <div>   
            <ul>
                <span class="tab"
                    :class="{ activeTab: selectedTab === tab }"
                    v-for="(tab, index) in tabs"
                    @click="selectedTab = tab"
                >{{ tab }}</span>
            </ul>
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul>
                    <li v-for="(review, index) in reviews" :key="index">
                        <p><strong>{{ review.name }}</strong></p>
                        <p>Rating: {{ review.rating }}</p>
                        <p>{{ review.review }}</p>
                        <p>Recomend: {{ review.recommend }}</p>
                    </li>
                </ul>
            </div>
            <div v-show="selectedTab === 'Make a Review'">
                <product-review></product-review>
            </div>

            <div v-show="selectedTab === 'Shipping'">
                <p>Shipping: {{ shippingCost }}</p>
            </div>

            <div v-show="selectedTab === 'Details'">
                <ul>
                    <li v-for="(detail, index) in productDetails" :key="index">
                        {{ detail }}
                    </li>
                </ul>
                <ul>
                    <li v-for="(sizes, index) in productSizes" :key="'sizes' + index">
                        {{ sizes }}
                    </li>
                </ul>
            </div>

        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        }
    }
})




let app = new Vue({
    el: '#app',
    data: {
        premium:true,
        cart: []
    },

    methods: {
        updateCart(id) {
            this.cart.push(id)
        },

        deleteToCart(id){
            const index = this.cart.indexOf(id)
            if (index !== -1){
               this.cart.splice(index, 1) 
            }
        }
    }
})